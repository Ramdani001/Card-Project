import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { getTopThreeSellingCards } from "@/services/master/card.service";

export const GET = async () => {
  try {
    const result = await getTopThreeSellingCards();

    return sendResponse({
      success: true,
      message: "Cards fetched successfully",
      data: result,
    });
  } catch (err) {
    return handleApiError(err);
  }
};
