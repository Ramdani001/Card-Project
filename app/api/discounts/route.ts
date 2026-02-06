import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);

    if (options.take) {
      const [discounts, total] = await Promise.all([prisma.discount.findMany(options), prisma.discount.count()]);

      return sendResponse({
        success: true,
        message: "All discounts fetched successfully",
        data: discounts,
        metadata: {
          total,
          page: page || 1,
          limit: limit || 10,
          totalPages: Math.ceil(total / (limit || 10)),
        },
      });
    }

    const allDiscount = await prisma.discount.findMany({
      ...options,
      orderBy: options.orderBy || { discount: "asc" },
    });

    return sendResponse({
      success: true,
      message: "All discounts fetched successfully",
      data: allDiscount,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const { discount, note } = await req.json();

    if (!discount) {
      return sendResponse({
        success: false,
        message: "Discount value is required",
        status: 400,
      });
    }

    const newDiscount = await prisma.discount.create({
      data: {
        discount,
        note,
      },
    });

    return sendResponse({
      success: true,
      message: "Discount created successfully",
      data: newDiscount,
      status: 201,
    });
  } catch (err) {
    return handleApiError(err);
  }
};
