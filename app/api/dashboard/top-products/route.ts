import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { getTopProducts } from "@/services/dashboard.service";

export const GET = async () => {
  try {
    const data = await getTopProducts();
    return sendResponse({ success: true, message: "Top products fetched", data });
  } catch (err) {
    return handleApiError(err);
  }
};
