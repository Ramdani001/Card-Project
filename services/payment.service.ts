import midtransClient from "midtrans-client";
import prisma from "@/lib/prisma";
import { TransactionStatus } from "@/prisma/generated/prisma/enums";
import { Prisma } from "@/prisma/generated/prisma/client";

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

export const createPaymentToken = async (transaction: any) => {
  const itemDetails = transaction.items.map((item: any) => ({
    id: item.cardId || "ITEM",
    price: Number(item.productPrice),
    quantity: item.quantity,
    name: item.productName.substring(0, 50),
  }));

  if (transaction.voucherAmount && Number(transaction.voucherAmount) > 0) {
    itemDetails.push({
      id: "VOUCHER-DISC",
      price: -Number(transaction.voucherAmount),
      quantity: 1,
      name: "Voucher Discount",
    });
  }

  const parameter = {
    transaction_details: {
      order_id: transaction.id,
      gross_amount: Number(transaction.totalPrice),
    },
    customer_details: {
      first_name: transaction.customerName || "Customer",
      email: transaction.customerEmail || "guest@example.com",
    },
    item_details: itemDetails,
  };

  const token = await snap.createTransaction(parameter);
  return token;
};

export const handlePaymentNotification = async (notificationBody: any) => {
  const statusResponse = await (snap as any).transaction.notification(notificationBody);

  const orderId = statusResponse.order_id;
  const transactionStatus = statusResponse.transaction_status;
  const fraudStatus = statusResponse.fraud_status;

  let newStatus: TransactionStatus = "PENDING";

  if (transactionStatus == "capture") {
    if (fraudStatus == "challenge") {
      newStatus = "PENDING";
    } else if (fraudStatus == "accept") {
      newStatus = "PAID";
    }
  } else if (transactionStatus == "settlement") {
    newStatus = "PAID";
  } else if (transactionStatus == "cancel" || transactionStatus == "expire") {
    newStatus = "CANCELLED";
  } else if (transactionStatus == "deny" || transactionStatus == "failure") {
    newStatus = "FAILED";
  } else {
    newStatus = "PENDING";
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      voucherId: true,
    },
  });

  if (!transaction) {
    return { status: "not found" };
  }

  if (transaction.status !== newStatus) {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.transaction.update({
        where: { id: orderId },
        data: { status: newStatus },
      });

      await tx.transactionStatusLog.create({
        data: {
          transactionId: orderId,
          status: newStatus,
          note: `Midtrans status: ${transactionStatus}`,
          createdBy: "MIDTRANS_WEBHOOK",
        },
      });

      const isCancelled = newStatus === "CANCELLED" || newStatus === "FAILED";
      const wasAlreadyCancelled = transaction.status === "CANCELLED" || transaction.status === "FAILED";

      if (isCancelled && !wasAlreadyCancelled) {
        const items = await tx.transactionItem.findMany({ where: { transactionId: orderId } });

        for (const item of items) {
          if (item.cardId) {
            await tx.card.update({
              where: { id: item.cardId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }

        if (transaction.voucherId) {
          await tx.voucher.update({
            where: { id: transaction.voucherId },
            data: { usedCount: { decrement: 1 } },
          });
        }
      }
    });
  }

  return { orderId, status: newStatus };
};
