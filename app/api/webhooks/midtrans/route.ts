import { NextRequest, NextResponse } from "next/server";
import { handlePaymentNotification } from "@/services/payment.service";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const result = await handlePaymentNotification(body);

    return NextResponse.json({ received: true, result });
  } catch (error) {
    console.error("Midtrans Webhook Error:", error);
    return NextResponse.json({ message: "Error processing notification" }, { status: 500 });
  }
};
