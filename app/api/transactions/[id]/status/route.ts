import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { authOptions } from "@/lib/auth";
import { cancelTransaction, markTransactionStatus, shipTransaction } from "@/services/transaction/transaction.service";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return sendResponse({ success: false, message: "Unauthorized", status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    const body = await req.json();
    const { status, resi, expedition, shippingCost, reason } = body;

    let result;

    switch (status) {
      case "SHIPPED":
        if (!resi || !expedition) {
          return sendResponse({
            success: false,
            message: "Resi & Ekspedisi wajib diisi!",
            data: null,
          });
        }
        result = await shipTransaction(id, { resi, expedition, shippingCost }, userId);
        break;

      case "CANCELLED":
        result = await cancelTransaction(id, reason || "Cancelled by Admin", userId);
        break;

      default:
        result = await markTransactionStatus(id, status, userId);
        break;
    }

    return sendResponse({
      success: true,
      message: `Transaction status updated to ${status}`,
      data: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
};
