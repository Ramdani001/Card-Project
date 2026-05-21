import { sendResponse, handleApiError } from "@/helpers/response.helper";
import { deleteBatchCards } from "@/services/master/card.service";
import { NextRequest } from "next/server";

export const DELETE = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return sendResponse({
        success: false,
        message: "Array of Card IDs is required",
        status: 400,
      });
    }

    const result = await deleteBatchCards(ids);

    return sendResponse({
      success: true,
      message: `${result.count} cards deleted successfully`,
      data: result,
      status: 200,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
