import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { getCategoryStats } from "@/services/dashboard.service";

export const GET = async () => {
  try {
    const data = await getCategoryStats();
    return sendResponse({ success: true, message: "Category stats fetched", data });
  } catch (err) {
    return handleApiError(err);
  }
};
