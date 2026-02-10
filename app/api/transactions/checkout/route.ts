import { NextRequest } from "next/server";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { checkout } from "@/services/transaction.service";

export const POST = async (req: NextRequest) => {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return sendResponse({ success: false, message: "Unauthorized", status: 401 });
    }

    const body = await req.json();
    const { customerName, customerEmail } = body;

    const transaction = await checkout({
      userId,
      customerName,
      customerEmail,
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
