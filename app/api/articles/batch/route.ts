import { sendResponse, handleApiError } from "@/helpers/response.helper";
import { deleteBatchArticles } from "@/services/master/article.service";
import { NextRequest } from "next/server";

export const DELETE = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return sendResponse({
        success: false,
        message: "Array of Article IDs is required",
        status: 400,
      });
    }

    const result = await deleteBatchArticles(ids);

    return sendResponse({
      success: true,
      message: `${result.count} articles deleted successfully`,
      data: result,
      status: 200,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
