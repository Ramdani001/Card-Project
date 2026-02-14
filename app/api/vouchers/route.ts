import { NextRequest } from "next/server";
import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { DiscountType } from "@/prisma/generated/prisma/client";
import { createVoucher, getVouchers } from "@/services/voucher.service";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);

    const { vouchers, total } = await getVouchers(options);

    return sendResponse({
      success: true,
      message: "Vouchers fetched successfully",
      data: vouchers,
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

    if (!body.code || !body.name || !body.type || !body.value || !body.startDate || !body.endDate) {
      return sendResponse({
        success: false,
        message: "Missing required fields",
        status: 400,
      });
    }

    const newVoucher = await createVoucher({
      code: body.code,
      name: body.name,
      description: body.description,
      type: body.type as DiscountType,
      value: Number(body.value),
      minPurchase: body.minPurchase ? Number(body.minPurchase) : undefined,
      maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : undefined,
      stock: body.stock ? Number(body.stock) : undefined,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    });

    return sendResponse({
      success: true,
      message: "Voucher created successfully",
      data: newVoucher,
      status: 201,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
