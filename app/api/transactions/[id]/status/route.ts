import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { authOptions } from "@/lib/auth";
import { updateTransactionStatus } from "@/services/transaction/transaction.service";
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

    if (status === "SHIPPED") {
      if (!resi || !expedition) {
        return sendResponse({
          success: false,
          message: "Resi & Ekspedisi wajib diisi untuk pengiriman!",
          status: 400,
        });
      }
    }

    const result = await updateTransactionStatus(id, status, {
      userId,
      note: reason,
      shippingData:
        status === "SHIPPED"
          ? {
              resi,
              expedition,
              shippingCost,
            }
          : undefined,
    });

    return sendResponse({
      success: true,
      message: `Transaction status updated to ${status}`,
      data: result,
    });
  } catch (error: any) {
    handleApiError(error);
  }
};
