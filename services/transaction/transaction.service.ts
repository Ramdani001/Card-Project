import prisma from "@/lib/prisma";
import { createPaymentToken } from "./payment.service";
import { DiscountType, NotificationType, Prisma, TransactionStatus } from "@/prisma/generated/prisma/client";
import { sendTransactionReceipt } from "../system/email.service";
import { createNotificationByCode } from "./notification.service";

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

const FAILED_STATUSES: TransactionStatus[] = [TransactionStatus.CANCELLED, TransactionStatus.FAILED, TransactionStatus.EXPIRED];

export const checkout = async (params: CreateTransactionParams) => {
  const { userId, customerName, customerEmail, voucherCode, address, paymentMethod } = params;

  const cart = await prisma.cart.findFirst({
    where: { userId },
    include: { items: { include: { card: { include: { categories: true } } } } },
  });

  if (!cart || cart.items.length === 0) throw new Error("Your cart is empty.");

  let subTotal = 0;
  const prismaItemsPayload: Prisma.TransactionItemCreateWithoutTransactionInput[] = [];
  const midtransItemsPayload: any[] = [];

  for (const item of cart.items) {
    if (!item.card) throw new Error(`Product data missing for item ID: ${item.id}`);

    const price = Number(item.card.price);
    const itemTotal = price * item.quantity;
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
      price: price,
      quantity: item.quantity,
      name: item.card.name.substring(0, 50),
    });
  }

  const transactionData = await prisma.$transaction(
    async (tx) => {
      let voucherAmount = 0;
      let voucherId: string | null = null;
      let finalTotal = subTotal;

      if (voucherCode) {
        const voucher = await tx.voucher.findUnique({
          where: { code: voucherCode },
          include: {
            voucherRoles: true,
            voucherCards: true,
            voucherCardCategories: true,
          },
        });

        if (!voucher) throw new Error("Invalid voucher code.");

        const now = new Date();
        if (now < voucher.startDate || now > voucher.endDate) throw new Error("Voucher is not active.");
        if (voucher.stock !== null && voucher.usedCount >= voucher.stock) throw new Error("Voucher out of stock.");
        if (voucher.minPurchase && subTotal < Number(voucher.minPurchase)) {
          throw new Error(`Min. purchase Rp ${Number(voucher.minPurchase).toLocaleString()} required.`);
        }

        if (voucher.voucherRoles.length > 0) {
          const user = await tx.user.findUnique({ where: { id: userId } });
          const isRoleAllowed = voucher.voucherRoles.some((vr) => vr.roleId === user?.roleId);
          if (!isRoleAllowed) throw new Error("Your account level cannot use this voucher.");
        }

        const hasSpecificProductLimit = voucher.voucherCards.length > 0;
        const hasSpecificCategoryLimit = voucher.voucherCardCategories.length > 0;

        if (hasSpecificProductLimit || hasSpecificCategoryLimit) {
          const cartCardIds = cart.items.map((item) => item.cardId);
          const allowedByCard = voucher.voucherCards.some((vc) => cartCardIds.includes(vc.cardId));
          const cartCategoryIds = cart.items.flatMap((item) => item.card.categories.map((e) => e.categoryId));
          const allowedByCategory = voucher.voucherCardCategories.some((vcc) => cartCategoryIds.includes(vcc.cardCategoryId));

          if (!allowedByCard && !allowedByCategory) {
            throw new Error("This voucher is not applicable to any items in your cart.");
          }
        }

        voucherAmount = voucher.type === DiscountType.NOMINAL ? Number(voucher.value) : subTotal * (Number(voucher.value) / 100);

        if (voucher.maxDiscount && voucherAmount > Number(voucher.maxDiscount)) voucherAmount = Number(voucher.maxDiscount);
        if (voucherAmount > subTotal) voucherAmount = subTotal;

        finalTotal = subTotal - voucherAmount;
        voucherId = voucher.id;

        await tx.voucher.update({
          where: { id: voucherId },
          data: { usedCount: { increment: 1 } },
        });
      }

      const randomStr = Math.floor(1000 + Math.random() * 9000);
      const invoiceNumber = `INV/${new Date().getFullYear()}/${Date.now()}-${randomStr}`;

      const newTransaction = await tx.transaction.create({
        data: {
          userId,
          invoice: invoiceNumber,
          subTotal: new Prisma.Decimal(subTotal),
          voucherAmount: new Prisma.Decimal(voucherAmount),
          totalPrice: new Prisma.Decimal(Math.max(0, finalTotal)),
          status: TransactionStatus.PENDING,
          customerName,
          customerEmail,
          address,
          voucherId,
          paymentMethod: paymentMethod,
          statusLogs: { create: { status: TransactionStatus.PENDING, note: "Checkout initiated", createdBy: userId } },
          items: { create: prismaItemsPayload },
        },
      });

      for (const item of cart.items) {
        const card = item.card!;

        if (card.maxQtyPurchase && item.quantity > card.maxQtyPurchase) {
          throw new Error(`Maximum purchase for '${card.name}' is ${card.maxQtyPurchase} pcs.`);
        }

        if (card.minQtyPurchase && item.quantity < card.minQtyPurchase) {
          throw new Error(`Minimum purchase for '${card.name}' is ${card.minQtyPurchase} pcs.`);
        }

        const updated = await tx.card.updateMany({
          where: {
            id: item.cardId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updated.count === 0) {
          throw new Error(`Insufficient stock for '${card.name}' (Only ${card.stock} pcs available).`);
        }
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return {
        transaction: newTransaction,
        finalTotal: Math.max(1, Math.floor(finalTotal)),
        voucherCode,
      };
    },
    { timeout: 10000 }
  );

  try {
    if (voucherCode && transactionData.transaction.voucherAmount.toNumber() > 0) {
      midtransItemsPayload.push({
        id: "VOUCHER-DISC",
        price: -Math.floor(transactionData.transaction.voucherAmount.toNumber()),
        quantity: 1,
        name: `Discount: ${voucherCode}`,
      });
    }

    const payment = await createPaymentToken({
      id: transactionData.transaction.id,
      totalPrice: transactionData.finalTotal,
      customerName,
      customerEmail,
      items: midtransItemsPayload,
    });

    return await prisma.transaction.update({
      where: { id: transactionData.transaction.id },
      data: {
        snapToken: payment.token,
        snapRedirect: payment.redirect_url,
        statusLogs: {
          create: {
            status: TransactionStatus.PENDING,
            note: "Payment link successfully generated",
            createdBy: "SYSTEM",
          },
        },
      },
      include: { items: true },
    });
  } catch (error) {
    console.error("Payment Gateway Error:", error);
    return transactionData.transaction;
  }
};

export const updateTransactionStatus = async (
  transactionId: string,
  status: TransactionStatus,
  options?: {
    note?: string;
    paymentMethod?: string;
    shippingData?: ShipTransactionParams;
    userId?: string;
  }
) => {
  const { note, paymentMethod, shippingData, userId = "SYSTEM" } = options || {};

  const result = await prisma.$transaction(async (tx) => {
    const oldTransaction = await tx.transaction.findUnique({
      where: { id: transactionId },
      select: { status: true, voucherId: true, subTotal: true, voucherAmount: true },
    });

    if (!oldTransaction) throw new Error("Transaction not found");

    if (status === TransactionStatus.SHIPPED && oldTransaction.status !== TransactionStatus.PAID) {
      throw new Error("Cannot ship an unpaid or cancelled transaction");
    }

    const updateData: Prisma.TransactionUpdateInput = {
      status,
      ...(paymentMethod && { paymentMethod }),
    };

    if (status === TransactionStatus.SHIPPED && shippingData) {
      const newShippingCost = shippingData.shippingCost || 0;
      const newTotalPrice = Number(oldTransaction.subTotal) - Number(oldTransaction.voucherAmount) + newShippingCost;

      updateData.resi = shippingData.resi;
      updateData.expedition = shippingData.expedition;
      updateData.shippingCost = new Prisma.Decimal(newShippingCost);
      updateData.totalPrice = new Prisma.Decimal(newTotalPrice);
    }

    const updatedTransaction = await tx.transaction.update({
      where: { id: transactionId },
      data: updateData,
      include: { items: true, user: true, voucher: true },
    });

    await tx.transactionStatusLog.create({
      data: {
        transactionId,
        status,
        previousStatus: oldTransaction.status,
        note: note || (status === TransactionStatus.SHIPPED ? `Sent via ${shippingData?.expedition}` : undefined),
        createdBy: userId,
      },
    });

    const isCancelled = FAILED_STATUSES.includes(status);
    const wasAlreadyCancelled = FAILED_STATUSES.includes(oldTransaction.status);

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

    await createNotificationByCode({
      notificationCode: "TRANSACTION_NOTIF",
      title: "Transaksi Baru",
      message: `Transaksi ${updatedTransaction.invoice} telah dibuat`,
      type: NotificationType.TRANSACTION,
      url: null,
      metadata: { transactionId: updatedTransaction.id },
    });

    return updatedTransaction;
  });

  // if (status === TransactionStatus.PAID && result) {
  sendTransactionReceipt(result).catch((err) => {
    console.error("Failed to send email receipt.", err);
  });

  await createNotificationByCode({
    notificationCode: "TRANSACTION_NOTIF",
    title: "Update Status Transaksi",
    message: `Transaksi ${result.invoice} berubah menjadi ${status}`,
    type: NotificationType.TRANSACTION,
    url: null,
    metadata: {
      transactionId: result.id,
      status,
    },
  });
  // }

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

  const enrichedLogs = logs.map((log) => {
    const userDetail = log.createdBy ? users.find((u) => u.id === log.createdBy) : null;

    return {
      ...log,
      user: userDetail || null,
    };
  });

  return { logs: enrichedLogs, total };
};

export const getTransactionById = async (id: string) => {
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

  return transaction;
};
