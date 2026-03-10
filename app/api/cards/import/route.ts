import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { authOptions } from "@/lib/auth";
import { importCardsFromExcel } from "@/services/master/card.service";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendResponse({ success: false, message: "Unauthorized", status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const results = await importCardsFromExcel(file, session.user.id);

    return sendResponse({
      success: true,
      message: "Card created successfully",
      data: results,
      status: 201,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
