import { NextRequest } from "next/server";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { getTransactionById } from "@/services/transaction.service";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const GET = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return sendResponse({ success: false, message: "Unauthorized", status: 401 });
    }

    const { id } = await params;
    const transaction = await getTransactionById(id, userId);

    if (!transaction) {
      return sendResponse({ success: false, message: "Transaction not found", status: 404 });
    }

    return sendResponse({
      success: true,
      message: "Transaction detail fetched",
      data: transaction,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized access to transaction") {
      return sendResponse({ success: false, message: err.message, status: 403 });
    }
    return handleApiError(err);
  }
};
