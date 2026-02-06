import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError, sendResponse } from "@/helpers/response.helper";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    const typeCard = await prisma.typeCard.findUnique({
      where: { idTypeCard: parseInt(id) },
    });

    if (!typeCard) {
      return sendResponse({
        success: false,
        message: "Type Card not found",
        status: 404,
      });
    }

    return sendResponse({
      success: true,
      message: "Type Card detail fetched successfully",
      data: typeCard,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const { name, note } = await req.json();

    const updated = await prisma.typeCard.update({
      where: { idTypeCard: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(note && { note }),
      },
    });

    return sendResponse({
      success: true,
      message: "Type Card updated successfully",
      data: updated,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    await prisma.typeCard.delete({
      where: { idTypeCard: parseInt(id) },
    });

    return sendResponse({
      success: true,
      message: "Type Card deleted successfully",
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
