import { logError } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { NotificationType, TransactionStatus } from "@/prisma/generated/prisma/enums";
import { createHash } from "crypto";
import midtransClient from "midtrans-client";
import { createNotificationByCode } from "./notification.service";

export interface MidtransItem {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

export interface PaymentTokenParams {
  id: string;
  totalPrice: number;
  customerName?: string;
  customerEmail?: string;
  items: MidtransItem[];
}

export interface MidtransNotificationDto {
  transaction_status: string;
  fraud_status?: string;
  order_id: string;
  gross_amount: string;
  status_code: string;
  signature_key: string;
  payment_type?: string;
  [key: string]: any;
}

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

export const createPaymentToken = async (params: PaymentTokenParams) => {
  const itemDetails = params.items.map((item) => ({
    id: item.id.substring(0, 50),
    price: Math.floor(item.price),
    quantity: item.quantity,
    name: item.name.substring(0, 50),
  }));

  const parameter = {
    transaction_details: {
      order_id: params.id,
      gross_amount: Math.floor(params.totalPrice),
    },
    customer_details: {
      first_name: params.customerName || "Customer",
      email: params.customerEmail || "guest@example.com",
    },
    item_details: itemDetails,
    credit_card: {
      secure: true,
    },
  };

  try {
    const token = await snap.createTransaction(parameter);
    return token;
  } catch (error) {
    logError("PaymentService.createPaymentToken", error);
    throw new Error("Failed to create payment token");
  }
};

export const verifyMidtransSignature = (notification: MidtransNotificationDto): boolean => {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
  const { order_id, status_code, gross_amount, signature_key } = notification;

  const input = order_id + status_code + gross_amount + serverKey;
  const signature = createHash("sha512").update(input).digest("hex");

  return signature === signature_key;
};

export const savePaymentLog = async (payload: any) => {
  try {
    await prisma.paymentLog.create({
      data: {
        orderId: payload.order_id || "UNKNOWN",
        provider: "MIDTRANS",
        status: payload.transaction_status || "UNKNOWN",
        rawPayload: payload,
      },
    });
  } catch (error) {
    logError("PaymentService.savePaymentLog", error);
  }
};

export const mapMidtransStatus = (transactionStatus: string, fraudStatus?: string): TransactionStatus => {
  if (transactionStatus === "capture") {
    if (fraudStatus === "challenge") {
      return "PENDING";
    }
    return TransactionStatus.PAID;
  } else if (transactionStatus === "settlement") {
    return TransactionStatus.PAID;
  } else if (transactionStatus === "deny" || transactionStatus === "expire") {
    return TransactionStatus.FAILED;
  } else if (transactionStatus === "cancel") {
    return TransactionStatus.FAILED;
  } else if (transactionStatus === "pending") {
    return TransactionStatus.PENDING;
  } else if (transactionStatus === "refund" || transactionStatus === "partial_refund") {
    return TransactionStatus.REFUNDED;
  }

  return TransactionStatus.FAILED;
};

export const sendPaymentNotification = async (orderId: string, status: "PAID" | "PENDING" | "FAILED" | "CANCELLED") => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        invoice: true,
      },
    });

    if (!transaction) return;

    await createNotificationByCode({
      notificationCode: "TRANSACTION_NOTIF",
      title: "Update Pembayaran",
      message: `Pembayaran transaksi ${transaction.invoice} ${status}`,
      type: NotificationType.TRANSACTION,
      url: null,
      metadata: {
        transactionId: transaction.id,
        status,
      },
    });
  } catch (error) {
    logError("PaymentService.sendPaymentNotification", error);
  }
};
