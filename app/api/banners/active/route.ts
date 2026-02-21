import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { getActiveBanners } from "@/services/master/banner.service";

export const GET = async () => {
  try {
    const banners = await getActiveBanners();

    return sendResponse({
      success: true,
      data: banners,
      message: "Banners fetched successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
};
