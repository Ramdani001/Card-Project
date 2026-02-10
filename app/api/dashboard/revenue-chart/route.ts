import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { getRevenueChart } from "@/services/dashboard.service";

export const GET = async () => {
  try {
    const data = await getRevenueChart();
    return sendResponse({ success: true, message: "Revenue chart data fetched", data });
  } catch (err) {
    return handleApiError(err);
  }
};
