import { sendResponse, handleApiError } from "@/helpers/response.helper";
import { authOptions } from "@/lib/auth";
import { deleteBatchCards } from "@/services/master/card.service";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export const DELETE = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendResponse({ success: false, message: "Unauthorized", status: 401 });
    }

    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return sendResponse({
        success: false,
        message: "Array of Card IDs is required",
        status: 400,
      });
    }

    const result = await deleteBatchCards(ids, session.user.id);

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
