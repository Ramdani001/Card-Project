import { NextRequest } from "next/server";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { checkout } from "@/services/transaction/transaction.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const POST = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendResponse({ success: false, message: "Unauthorized", status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return sendResponse({ success: false, message: "Unauthorized", status: 401 });
    }

    const body = await req.json();
    const { address, paymentMethod, voucherCode, customerEmailGuest, customerNameGuest } = body;

    const transaction = await checkout({
      userId,
      customerName: session.user.name || customerNameGuest,
      customerEmail: session.user.email || customerEmailGuest,
      address,
      paymentMethod,
      voucherCode,
    });

    return sendResponse({
      success: true,
      message: "Checkout successful",
      data: transaction,
      status: 201,
    });
  } catch (err: any) {
    if (err.message === "Cart is empty") {
      return sendResponse({ success: false, message: err.message, status: 400 });
    }
    if (err.message.includes("Insufficient stock")) {
      return sendResponse({ success: false, message: err.message, status: 400 });
    }
    return handleApiError(err);
  }
};
