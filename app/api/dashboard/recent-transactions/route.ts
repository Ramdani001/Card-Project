import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { getRecentTransactions } from "@/services/dashboard.service";

export const GET = async () => {
  try {
    const data = await getRecentTransactions();
    return sendResponse({ success: true, message: "Recent transactions fetched", data });
  } catch (err) {
    return handleApiError(err);
  }
};
