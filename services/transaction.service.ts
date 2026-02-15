import prisma from "@/lib/prisma";
import { createPaymentToken } from "./payment.service";
import { Prisma, TransactionStatus } from "@/prisma/generated/prisma/client";
import { sendTransactionReceipt } from "./email.service";

interface CreateTransactionParams {
  userId: string;
  customerName?: string;
  customerEmail?: string;
  voucherCode?: string;
  address: string;
  paymentMethod?: string;
}

interface GetTransactionParams {
  skip?: number;
  take?: number;
  orderBy?: Prisma.TransactionOrderByWithRelationInput;
  where?: Prisma.TransactionWhereInput;
}

interface ShipTransactionParams {
  resi: string;
  expedition: string;
  shippingCost?: number;
}

export const checkout = async (params: CreateTransactionParams) => {
  const { userId, customerName, customerEmail, voucherCode, address, paymentMethod } = params;

  const cart = await prisma.cart.findFirst({
    where: { userId },
    include: {
      items: { include: { card: true } },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  let subTotal = 0;
  const prismaItemsPayload: Prisma.TransactionItemCreateWithoutTransactionInput[] = [];
  const midtransItemsPayload: any[] = [];

  for (const item of cart.items) {
    if (!item.card) throw new Error(`Product data missing for item ID: ${item.id}`);

    if (item.card.stock < item.quantity) {
      throw new Error(`Insufficient stock for: ${item.card.name}. Available: ${item.card.stock}`);
    }

    const itemTotal = Number(item.card.price) * item.quantity;
    subTotal += itemTotal;

    prismaItemsPayload.push({
      card: { connect: { id: item.card.id } },
      productName: item.card.name,
      productPrice: item.card.price,
      quantity: item.quantity,
      subTotal: new Prisma.Decimal(itemTotal),
      skuSnapshot: item.card.sku,
    });

    midtransItemsPayload.push({
      id: item.card.id.substring(0, 20),
      price: Number(item.card.price),
      quantity: item.quantity,
      name: item.card.name.substring(0, 50),
    });
  }

  let voucherAmount = 0;
  let voucherId: string | null = null;
  let finalTotal = subTotal;

  if (voucherCode) {
    const voucher = await prisma.voucher.findUnique({ where: { code: voucherCode } });
    if (!voucher) throw new Error("Invalid voucher code");

    const now = new Date();
    if (now < voucher.startDate || now > voucher.endDate) throw new Error("Voucher is expired or not started yet");

    if (voucher.stock !== null && voucher.usedCount >= voucher.stock) throw new Error("Voucher usage limit reached");

    if (voucher.minPurchase && subTotal < Number(voucher.minPurchase)) {
      throw new Error(`Minimum purchase for this voucher is Rp ${Number(voucher.minPurchase).toLocaleString()}`);
    }

    if (voucher.type === "NOMINAL") {
      voucherAmount = Number(voucher.value);
    } else if (voucher.type === "PERCENTAGE") {
      voucherAmount = subTotal * (Number(voucher.value) / 100);
      if (voucher.maxDiscount && voucherAmount > Number(voucher.maxDiscount)) {
        voucherAmount = Number(voucher.maxDiscount);
      }
    }

    if (voucherAmount > subTotal) voucherAmount = subTotal;

    finalTotal = subTotal - voucherAmount;
    voucherId = voucher.id;

    if (voucherAmount > 0) {
      midtransItemsPayload.push({
        id: "VOUCHER-DISC",
        price: -Math.floor(voucherAmount),
        quantity: 1,
        name: `Voucher: ${voucherCode}`,
      });
    }
  }

  const randomStr = Math.floor(1000 + Math.random() * 9000);
  const invoiceNumber = `INV/${new Date().getFullYear()}/${Date.now()}-${randomStr}`;

  return await prisma.$transaction(
    async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          userId,
          invoice: invoiceNumber,
          subTotal: new Prisma.Decimal(subTotal),
          voucherAmount: new Prisma.Decimal(voucherAmount),
          totalPrice: new Prisma.Decimal(finalTotal < 0 ? 0 : finalTotal),
          status: "PENDING",
          customerName,
          customerEmail,
          address,
          voucherId,
          paymentMethod: paymentMethod || "MIDTRANS",
          statusLogs: {
            create: { status: "PENDING", note: "Checkout initiated", createdBy: "SYSTEM" },
          },
          items: {
            create: prismaItemsPayload,
          },
        },
      });

      for (const item of cart.items) {
        const updatedBatch = await tx.card.updateMany({
          where: {
            id: item.cardId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updatedBatch.count === 0) {
          throw new Error(`Checkout Failed: Stock for product '${item.card?.name}' is no longer available.`);
        }
      }

      if (voucherId) {
        await tx.voucher.update({
          where: { id: voucherId },
          data: { usedCount: { increment: 1 } },
        });
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      const payment = await createPaymentToken({
        id: newTransaction.id,
        totalPrice: Math.max(1, Math.floor(finalTotal)),
        customerName,
        customerEmail,
        items: midtransItemsPayload,
      });

      return await tx.transaction.update({
        where: { id: newTransaction.id },
        data: {
          snapToken: payment.token,
          snapRedirect: payment.redirect_url,
        },
        include: { items: true },
      });
    },
    {
      timeout: 10000,
    }
  );
};

export const updateTransactionStatus = async (transactionId: string, status: TransactionStatus, note?: string, paymentMethod?: string) => {
  const result = await prisma.$transaction(async (tx) => {
    const oldTransaction = await tx.transaction.findUnique({
      where: { id: transactionId },
      select: { status: true, voucherId: true },
    });

    if (!oldTransaction) throw new Error("Transaction not found");

    const updatedTransaction = await tx.transaction.update({
      where: { id: transactionId },
      data: { status, ...(paymentMethod && { paymentMethod: paymentMethod }) },
      include: {
        items: true,
        user: true,
        voucher: true,
      },
    });

    await tx.transactionStatusLog.create({
      data: {
        transactionId,
        status,
        previousStatus: oldTransaction.status,
        note,
        createdBy: "SYSTEM_WEBHOOK",
      },
    });

    const isCancelled = ["CANCELLED", "FAILED", "EXPIRED"].includes(status);
    const wasAlreadyCancelled = ["CANCELLED", "FAILED", "EXPIRED"].includes(oldTransaction.status);

    if (isCancelled && !wasAlreadyCancelled) {
      const items = await tx.transactionItem.findMany({
        where: { transactionId },
        select: { cardId: true, quantity: true },
      });

      for (const item of items) {
        if (item.cardId) {
          await tx.card.update({
            where: { id: item.cardId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      if (oldTransaction.voucherId) {
        await tx.voucher.update({
          where: { id: oldTransaction.voucherId },
          data: { usedCount: { decrement: 1 } },
        });
      }
    }

    return updatedTransaction;
  });

  if (status === "PAID" && result) {
    sendTransactionReceipt(result).catch((err) => {
      console.error("Background task error: Failed to send email receipt.", err);
    });
  }

  return result;
};

export const getTransactions = async (params: GetTransactionParams) => {
  const { skip, take, orderBy, where } = params;

  const whereClause: Prisma.TransactionWhereInput = {
    ...where,
  };

  const [total, transactions] = await prisma.$transaction([
    prisma.transaction.count({ where: whereClause }),
    prisma.transaction.findMany({
      where: whereClause,
      skip,
      take,
      orderBy: orderBy || { createdAt: "desc" },
      include: {
        items: true,
        voucher: true,
        statusLogs: { orderBy: { createdAt: "desc" }, take: 1 },
        user: { select: { email: true, name: true } },
      },
    }),
  ]);

  return { transactions, total };
};

export const getUserTransactions = async (userId: string, params: GetTransactionParams) => {
  const { skip, take, orderBy, where } = params;

  const whereClause: Prisma.TransactionWhereInput = {
    userId,
    ...where,
  };

  const [total, transactions] = await prisma.$transaction([
    prisma.transaction.count({ where: whereClause }),
    prisma.transaction.findMany({
      where: whereClause,
      skip,
      take,
      orderBy: orderBy || { createdAt: "desc" },
      include: {
        items: true,
        voucher: true,
        statusLogs: { orderBy: { createdAt: "desc" }, take: 1 },
        user: { select: { email: true, name: true } },
      },
    }),
  ]);

  return { transactions, total };
};

export const getHistoryTransactions = async (
  transactionId: string,
  params: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.TransactionStatusLogOrderByWithRelationInput;
    where?: Prisma.TransactionStatusLogWhereInput;
  }
) => {
  const { skip, take, orderBy, where } = params;

  const whereClause: Prisma.TransactionStatusLogWhereInput = {
    transactionId,
    ...where,
  };

  const [total, logs] = await prisma.$transaction([
    prisma.transactionStatusLog.count({ where: whereClause }),
    prisma.transactionStatusLog.findMany({
      where: whereClause,
      skip,
      take,
      orderBy: orderBy || { createdAt: "desc" },
    }),
  ]);

  const userIds = logs
    .map((log) => log.createdBy)
    .filter((id): id is string => {
      if (!id) return false;

      return true;
    });

  const uniqueUserIds = Array.from(new Set(userIds));

  const users = await prisma.user.findMany({
    where: {
      id: { in: uniqueUserIds },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  // 4. Gabungkan (Enrich)
  const enrichedLogs = logs.map((log) => {
    // Safety check saat find user
    const userDetail = log.createdBy ? users.find((u) => u.id === log.createdBy) : null;

    return {
      ...log,
      user: userDetail || null,
    };
  });

  return { logs: enrichedLogs, total };
};

export const getTransactionById = async (id: string, userId?: string) => {
  if (!id) return null;

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      items: {
        include: { card: { select: { name: true, images: { take: 1 } } } },
      },
      voucher: true,
      statusLogs: { orderBy: { createdAt: "desc" } },
      user: { select: { name: true, email: true } },
    },
  });

  if (!transaction) return null;

  if (userId) {
    if (transaction.userId !== userId) {
      throw new Error("Unauthorized Access to Transaction");
    }
  }

  return transaction;
};

export const markTransactionStatus = async (id: string, status: TransactionStatus, userId: string = "ADMIN") => {
  return await prisma.$transaction(async (tx) => {
    const updated = await tx.transaction.update({
      where: { id },
      data: { status },
    });

    await tx.transactionStatusLog.create({
      data: {
        transactionId: id,
        status,
        note: `Status updated to ${status}`,
        createdBy: userId,
      },
    });

    return updated;
  });
};

export const shipTransaction = async (id: string, data: ShipTransactionParams, userId: string = "ADMIN") => {
  return await prisma.$transaction(async (tx) => {
    const oldData = await tx.transaction.findUniqueOrThrow({ where: { id } });

    const newShippingCost = data.shippingCost || 0;
    const newTotalPrice = Number(oldData.subTotal) - Number(oldData.voucherAmount) + newShippingCost;

    const updated = await tx.transaction.update({
      where: { id },
      data: {
        status: "SHIPPED",
        resi: data.resi,
        expedition: data.expedition,
        shippingCost: newShippingCost,
        totalPrice: newTotalPrice,
      },
    });

    await tx.transactionStatusLog.create({
      data: {
        transactionId: id,
        status: "SHIPPED",
        note: `Barang dikirim via ${data.expedition}. Resi: ${data.resi}`,
        createdBy: userId,
      },
    });

    return updated;
  });
};

export const cancelTransaction = async (id: string, reason: string, userId: string = "ADMIN") => {
  return await prisma.$transaction(async (tx) => {
    const updated = await tx.transaction.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    await tx.transactionStatusLog.create({
      data: {
        transactionId: id,
        status: "CANCELLED",
        note: `Transaction cancelled. Reason: ${reason}`,
        createdBy: userId,
      },
    });

    return updated;
  });
};
