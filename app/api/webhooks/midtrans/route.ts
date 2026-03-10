import { NextRequest, NextResponse } from "next/server";
import { mapMidtransStatus, savePaymentLog, verifyMidtransSignature } from "@/services/transaction/payment.service";
import { updateTransactionStatus } from "@/services/transaction/transaction.service";
import { NotificationType } from "@/prisma/generated/prisma/client";
import { createNotificationByCode } from "@/services/transaction/notification.service";

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
      console.error(`Invalid Signature for Order: ${body.order_id}`);
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

    const transaction = await updateTransactionStatus(body.order_id, newStatus, {
      note: `Midtrans Webhook: ${body.transaction_status} (${body.status_message || "No Msg"})`,
      paymentMethod: paymentType,
      userId: "MIDTRANS_WEBHOOK",
    });

    if (transaction) {
      await createNotificationByCode({
        notificationCode: "TRANSACTION_NOTIF",
        title: "Update Pembayaran",
        message: `Transaksi ${transaction.invoice} berubah menjadi ${newStatus}`,
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
    console.error("Midtrans Webhook Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};
