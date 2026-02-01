import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { sendResponse } from "@/helpers/response.helper";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    const discount = await prisma.discount.findUnique({
      where: { idDiscount: parseInt(id) },
    });

    if (!discount) {
      return sendResponse({
        success: false,
        message: "Discount not found",
        status: 404,
      });
    }

    return sendResponse({
      success: true,
      message: "Discount detail fetched successfully",
      data: discount,
    });
  } catch (err) {
    console.error(err);

    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const { discount, note } = await req.json();

    const updated = await prisma.discount.update({
      where: { idDiscount: parseInt(id) },
      data: {
        ...(discount && { discount }),
        ...(note && { note }),
      },
    });

    return sendResponse({
      success: true,
      message: "Discount updated successfully",
      data: updated,
    });
  } catch (err: any) {
    console.error(err);
    const isNotFound = err.code === "P2025";

    return sendResponse({
      success: false,
      message: isNotFound ? "Discount not found" : "Failed to update discount",
      status: isNotFound ? 404 : 400,
    });
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    await prisma.discount.delete({
      where: { idDiscount: parseInt(id) },
    });

    return sendResponse({
      success: true,
      message: "Discount deleted successfully",
    });
  } catch (err: any) {
    console.error(err);
    const isNotFound = err.code === "P2025";

    return sendResponse({
      success: false,
      message: isNotFound ? "Discount not found" : "Failed to delete discount",
      status: isNotFound ? 404 : 500,
    });
  }
};
