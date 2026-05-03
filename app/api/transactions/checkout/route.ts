import { NextRequest } from "next/server";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { checkout } from "@/services/transaction/transaction.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DeliveryMethod } from "@/prisma/generated/prisma/enums";

export const POST = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return sendResponse({
        success: false,
        message: "Unauthorized",
        status: 401,
      });
    }

    const body = await req.json();

    const { address, voucherCode, customerEmailGuest, customerNameGuest, deliveryMethod, shopId } = body;

    if (deliveryMethod === "SHIP" && !address?.trim()) {
      return sendResponse({
        success: false,
        message: "Shipping address is required",
        status: 400,
      });
    }

    if (deliveryMethod === "PICKUP" && !shopId) {
      return sendResponse({
        success: false,
        message: "Pickup shop is required",
        status: 400,
      });
    }

    const transaction = await checkout({
      userId: session.user.id,
      customerName: session.user.name || customerNameGuest,
      customerEmail: session.user.email || customerEmailGuest,
      address: deliveryMethod === DeliveryMethod.SHIP ? address : null,
      shopId: deliveryMethod === DeliveryMethod.PICKUP ? shopId : null,
      deliveryMethod,
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
