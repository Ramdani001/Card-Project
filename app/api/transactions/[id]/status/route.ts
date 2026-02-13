import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { authOptions } from "@/lib/auth";
import { updateTransactionStatus } from "@/services/transaction.service";
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

    if (session.user.role !== "Administrator") {
      return sendResponse({ success: false, message: "Forbidden: Admin access required", status: 403 });
    }

    const { id } = await params;

    const body = await req.json();
    const { status, note } = body;

    const validStatuses = ["PENDING", "PAID", "PROCESSED", "SHIPPED", "COMPLETED", "CANCELLED", "FAILED"];
    if (!status || !validStatuses.includes(status)) {
      return sendResponse({ success: false, message: "Invalid status provided", status: 400 });
    }

    const updatedTransaction = await updateTransactionStatus(id, status, note || "Updated by Admin");

    return sendResponse({
      success: true,
      message: `Transaction status updated to ${status}`,
      data: updatedTransaction,
    });
  } catch (error) {
    return handleApiError(error);
  }
};
