import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError, sendResponse } from "@/helpers/response.helper";

type RouteParams = {
  params: Promise<{ code: string }>;
};

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { code } = await params;

    const discount = await prisma.appConfig.findFirst({
      where: { code },
    });

    if (!discount) {
      return sendResponse({
        success: false,
        message: "Config not found",
        status: 404,
      });
    }

    return sendResponse({
      success: true,
      message: "Config fetched successfully",
      data: discount,
    });
  } catch (err) {
    return handleApiError(err);
  }
};
