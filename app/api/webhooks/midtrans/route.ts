import { NextRequest, NextResponse } from "next/server";
import { mapMidtransStatus, savePaymentLog, verifyMidtransSignature } from "@/services/transaction/payment.service";
import { updateTransactionStatus } from "@/services/transaction/transaction.service";
import { NotificationType } from "@/prisma/generated/prisma/client";
import { createNotificationByCode } from "@/services/transaction/notification.service";
import { logError } from "@/lib/logger";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    await savePaymentLog(body);

    const isValidSignature = verifyMidtransSignature({
      order_id: body.order_id,
      status_code: body.status_code,
      gross_amount: body.gross_amount,
      signature_key: body.signature_key,
      transaction_status: body.transaction_status,
    });

    if (!isValidSignature) {
      logError("Midtrans Webhook Route [POST]", `Invalid Signature for Order: ${body.order_id}`);
      return NextResponse.json({ message: "Invalid Signature" }, { status: 403 });
    }

    const newStatus = mapMidtransStatus(body.transaction_status, body.fraud_status);

    let paymentType = body.payment_type?.toUpperCase().replace("_", " ") || "UNKNOWN";

    if (body.payment_type === "bank_transfer" && body.va_numbers) {
      const bank = body.va_numbers[0]?.bank?.toUpperCase();
      paymentType = `BANK TRANSFER - ${bank}`;
    } else if (body.payment_type === "echannel") {
      paymentType = "MANDIRI BILL";
    }

    let midtransNote = `[Midtrans] Status: ${body.transaction_status.toUpperCase()}`;

    if (body.refunds && body.refunds.length > 0) {
      const latest = body.refunds[body.refunds.length - 1];
      const reason = latest.reason ? ` | Reason: ${latest.reason}` : "";
      const amount = latest.refund_amount ? ` | Amount: ${latest.refund_amount}` : "";

      midtransNote += ` (Refunded: ${reason}${amount})`;
    } else {
      midtransNote += ` | Msg: ${body.status_message || "No message"}`;
    }

    const transaction = await updateTransactionStatus(body.order_id, newStatus, {
      note: midtransNote,
      paymentMethod: paymentType,
      userId: "MIDTRANS_WEBHOOK",
    });

    if (transaction) {
      await createNotificationByCode({
        notificationCode: "TRANSACTION_NOTIF",
        title: "Payment Updates",
        message: `Transaction ${transaction.invoice} updated to ${newStatus}`,
        type: NotificationType.TRANSACTION,
        url: null,
        metadata: {
          transactionId: transaction.id,
          status: newStatus,
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logError("Midtrans Webhook Route [POST]", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};
