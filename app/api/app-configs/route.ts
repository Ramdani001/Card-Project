import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);

    if (options.take) {
      const [discounts, total] = await Promise.all([prisma.appConfig.findMany(options), prisma.appConfig.count()]);

      return sendResponse({
        success: true,
        message: "Configs fetched successfully",
        data: discounts,
        metadata: {
          total,
          page: page || 1,
          limit: limit || 10,
          totalPages: Math.ceil(total / (limit || 10)),
        },
      });
    }

    const allDiscount = await prisma.appConfig.findMany({
      ...options,
      orderBy: options.orderBy || { createdAt: "asc" },
    });

    return sendResponse({
      success: true,
      message: "Configs fetched successfully",
      data: allDiscount,
    });
  } catch (err) {
    return handleApiError(err);
  }
};
