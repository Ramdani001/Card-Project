import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { getDashboardOverview } from "@/services/dashboard.service";

export const GET = async () => {
  try {
    const data = await getDashboardOverview();
    return sendResponse({ success: true, message: "Summary fetched", data });
  } catch (err) {
    return handleApiError(err);
  }
};
