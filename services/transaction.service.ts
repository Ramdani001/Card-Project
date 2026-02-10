import prisma from "@/lib/prisma";
import { createPaymentToken } from "./payment.service";
import { Prisma, TransactionStatus } from "@/prisma/generated/prisma/client";

interface CreateTransactionParams {
  userId: string;
  customerName?: string;
  customerEmail?: string;
  voucherCode?: string;
  address: string;
  paymentMethod?: string;
}

export const checkout = async (params: CreateTransactionParams) => {
  const { userId, customerName, customerEmail, voucherCode, address, paymentMethod } = params;

  const cart = await prisma.cart.findFirst({
    where: { userId, isActive: true },
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
    if (!item.card) throw new Error("Product data missing");
    if (item.card.stock < item.quantity) {
      throw new Error(`Insufficient stock for: ${item.card.name}`);
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
      id: item.card.id,
      price: Number(item.card.price),
      quantity: item.quantity,
      name: item.card.name,
    });
  }

  let voucherAmount = 0;
  let voucherId: string | null = null;
  let finalTotal = subTotal;

  if (voucherCode) {
    const voucher = await prisma.voucher.findUnique({
      where: { code: voucherCode, isActive: true },
    });

    if (!voucher) throw new Error("Invalid voucher code");

    const now = new Date();
    if (now < voucher.startDate || now > voucher.endDate) throw new Error("Voucher expired or not started");
    if (voucher.stock !== null && voucher.usedCount >= voucher.stock) throw new Error("Voucher limit reached");
    if (voucher.minPurchase && subTotal < Number(voucher.minPurchase)) throw new Error(`Min purchase is ${voucher.minPurchase}`);

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
        id: "VOUCHER",
        price: -voucherAmount,
        quantity: 1,
        name: `Voucher: ${voucherCode}`,
      });
    }
  }

  const invoiceNumber = `INV/${new Date().getFullYear()}/${Date.now()}`;

  return await prisma.$transaction(async (tx) => {
    const newTransaction = await tx.transaction.create({
      data: {
        userId,
        invoice: invoiceNumber,
        subTotal: new Prisma.Decimal(subTotal),
        voucherAmount: new Prisma.Decimal(voucherAmount),
        totalPrice: new Prisma.Decimal(finalTotal),
        status: "PENDING",
        customerName,
        customerEmail,
        address: address,
        voucherId,
        statusLogs: {
          create: { status: "PENDING", note: "Checkout initiated", createdBy: "SYSTEM" },
        },
        items: {
          create: prismaItemsPayload,
        },
        paymentMethod: paymentMethod,
      },
    });

    await Promise.all(
      cart.items.map((item) =>
        tx.card.update({
          where: { id: item.cardId },
          data: { stock: { decrement: item.quantity } },
        })
      )
    );

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
      totalPrice: finalTotal,
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
  });
};

export const updateTransactionStatus = async (transactionId: string, status: TransactionStatus, note?: string) => {
  return await prisma.$transaction(async (tx) => {
    const oldTransaction = await tx.transaction.findUnique({
      where: { id: transactionId },
      select: { status: true, voucherId: true },
    });

    if (!oldTransaction) throw new Error("Transaction not found");

    const updated = await tx.transaction.update({
      where: { id: transactionId },
      data: { status },
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

    const isCancelled = status === "CANCELLED" || status === "FAILED";
    const wasAlreadyCancelled = oldTransaction.status === "CANCELLED" || oldTransaction.status === "FAILED";

    if (isCancelled && !wasAlreadyCancelled) {
      const items = await tx.transactionItem.findMany({
        where: { transactionId },
        select: { cardId: true, quantity: true },
      });

      await Promise.all(
        items.map((item) => {
          if (item.cardId) {
            return tx.card.update({
              where: { id: item.cardId },
              data: { stock: { increment: item.quantity } },
            });
          }
          return Promise.resolve();
        })
      );

      if (oldTransaction.voucherId) {
        await tx.voucher.update({
          where: { id: oldTransaction.voucherId },
          data: { usedCount: { decrement: 1 } },
        });
      }
    }

    return updated;
  });
};

interface GetTransactionParams {
  skip?: number;
  take?: number;
  orderBy?: Prisma.TransactionOrderByWithRelationInput;
  where?: Prisma.TransactionWhereInput;
}

export const getTransactions = async (userId: string, params: GetTransactionParams) => {
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
      },
    }),
  ]);

  return { transactions, total };
};

export const getTransactionById = async (id: string, userId: string) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      items: true,
      voucher: true,
      statusLogs: { orderBy: { createdAt: "desc" } },
      user: { select: { name: true, email: true } },
    },
  });

  if (!transaction) return null;
  if (transaction.userId !== userId) throw new Error("Unauthorized");

  return transaction;
};
