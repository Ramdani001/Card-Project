import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { sendResponse } from "@/helpers/response.helper";

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
    console.error(err);
    const isNotFound = err.code === "P2025";

    return sendResponse({
      success: false,
      message: isNotFound ? "Type Card not found" : "Failed to update type card",
      status: isNotFound ? 404 : 400,
    });
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
    console.error(err);
    const isNotFound = err.code === "P2025";

    return sendResponse({
      success: false,
      message: isNotFound ? "Type Card not found" : "Failed to delete type card",
      status: isNotFound ? 404 : 500,
    });
  }
};
