import { NextRequest } from "next/server";
import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { createDiscount, getDiscounts } from "@/services/discount.service";
import { DiscountType } from "@/prisma/generated/prisma/client";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);

    const { discounts, total } = await getDiscounts(options);

    return sendResponse({
      success: true,
      message: "Discounts fetched successfully",
      data: discounts,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { name, value, type } = body;

    if (!name || !value || !type) {
      return sendResponse({ success: false, message: "Name, Value, and Type are required", status: 400 });
    }

    if (!Object.values(DiscountType).includes(type)) {
      return sendResponse({ success: false, message: "Invalid Discount Type (NOMINAL or PERCENTAGE)", status: 400 });
    }

    const newDiscount = await createDiscount({
      name,
      value: Number(value),
      type: type as DiscountType,
    });

    return sendResponse({
      success: true,
      message: "Discount created successfully",
      data: newDiscount,
      status: 201,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
