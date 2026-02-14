import midtransClient from "midtrans-client";
import { createHash } from "crypto";

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
    console.error("Midtrans Error:", error);
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

export const mapMidtransStatus = (transactionStatus: string, fraudStatus?: string): "PAID" | "PENDING" | "FAILED" | "CANCELLED" => {
  if (transactionStatus === "capture") {
    if (fraudStatus === "challenge") {
      return "PENDING";
    }
    return "PAID";
  } else if (transactionStatus === "settlement") {
    return "PAID";
  } else if (transactionStatus === "cancel" || transactionStatus === "deny" || transactionStatus === "expire") {
    return "FAILED";
  } else if (transactionStatus === "pending") {
    return "PENDING";
  }

  return "FAILED";
};
