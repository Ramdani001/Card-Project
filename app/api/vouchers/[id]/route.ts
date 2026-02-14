import { NextRequest } from "next/server";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { deleteVoucher, getVoucherById, updateVoucher } from "@/services/voucher.service";
import { DiscountType } from "@/prisma/generated/prisma/enums";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const discount = await getVoucherById(id);

    if (!discount) return sendResponse({ success: false, message: "Voucher not found", status: 404 });

    return sendResponse({
      success: true,
      message: "Voucher fetched successfully",
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

    const updatedVoucher = await updateVoucher({
      id,
      ...body,
      ...(body.value && { value: Number(body.value) }),
      ...(body.minPurchase !== undefined && { minPurchase: Number(body.minPurchase) }),
      ...(body.maxDiscount !== undefined && { maxDiscount: Number(body.maxDiscount) }),
      ...(body.stock !== undefined && { stock: Number(body.stock) }),
      ...(body.startDate && { startDate: new Date(body.startDate) }),
      ...(body.endDate && { endDate: new Date(body.endDate) }),
      ...(body.type && { type: body.type as DiscountType }),
    });

    return sendResponse({
      success: true,
      message: "Voucher updated successfully",
      data: updatedVoucher,
    });
  } catch (err: any) {
    if (err.message === "Voucher not found") return sendResponse({ success: false, message: err.message, status: 404 });
    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    await deleteVoucher(id);
    return sendResponse({ success: true, message: "Voucher deleted successfully" });
  } catch (err: any) {
    if (err.message === "Voucher not found") return sendResponse({ success: false, message: err.message, status: 404 });
    return handleApiError(err);
  }
};
