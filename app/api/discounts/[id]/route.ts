import { NextRequest } from "next/server";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { deleteDiscount, getDiscountById, updateDiscount } from "@/services/discount.service";
import { DiscountType } from "@/prisma/generated/prisma/client";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const discount = await getDiscountById(id);

    if (!discount) return sendResponse({ success: false, message: "Discount not found", status: 404 });

    return sendResponse({
      success: true,
      message: "Discount fetched successfully",
      data: discount,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const body = await req.json();

    if (body.type && !Object.values(DiscountType).includes(body.type)) {
      return sendResponse({ success: false, message: "Invalid Discount Type", status: 400 });
    }

    const updatedDiscount = await updateDiscount({
      id,
      ...body,
      value: body.value ? Number(body.value) : undefined,
    });

    return sendResponse({
      success: true,
      message: "Discount updated successfully",
      data: updatedDiscount,
    });
  } catch (err: any) {
    if (err.message === "Discount not found") return sendResponse({ success: false, message: err.message, status: 404 });
    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    await deleteDiscount(id);
    return sendResponse({ success: true, message: "Discount deleted successfully" });
  } catch (err: any) {
    if (err.message === "Discount not found") return sendResponse({ success: false, message: err.message, status: 404 });
    return handleApiError(err);
  }
};
