import { NextRequest, NextResponse } from "next/server";
import { mapMidtransStatus, verifyMidtransSignature } from "@/services/payment.service";
import { updateTransactionStatus } from "@/services/transaction.service";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const isValidSignature = verifyMidtransSignature({
      order_id: body.order_id,
      status_code: body.status_code,
      gross_amount: body.gross_amount,
      signature_key: body.signature_key,
      transaction_status: body.transaction_status,
    });

    if (!isValidSignature) {
      return NextResponse.json({ message: "Invalid Signature" }, { status: 403 });
    }

    const newStatus = mapMidtransStatus(body.transaction_status, body.fraud_status);

    await updateTransactionStatus(body.order_id, newStatus, `Midtrans Webhook: ${body.transaction_status} (${body.status_message || "No Msg"})`);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Midtrans Webhook Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
};
