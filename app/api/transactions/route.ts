import { NextRequest } from "next/server";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { getTransactions } from "@/services/transaction.service";

export const GET = async (req: NextRequest) => {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return sendResponse({ success: false, message: "Unauthorized", status: 401 });
    }

    const transactions = await getTransactions(userId);

    return sendResponse({
      success: true,
      message: "Transaction history fetched",
      data: transactions,
    });
  } catch (err) {
    return handleApiError(err);
  }
};
