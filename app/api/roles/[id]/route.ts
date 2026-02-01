import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError, sendResponse } from "@/helpers/response.helper";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    const role = await prisma.role.findUnique({
      where: { idRole: parseInt(id) },
    });

    if (!role) {
      return sendResponse({
        success: false,
        message: "Role not found",
        status: 404,
      });
    }

    return sendResponse({
      success: true,
      message: "Role detail fetched successfully",
      data: role,
    });
  } catch (err) {
    console.error(err);

    return sendResponse({
      success: false,
      message: err instanceof Error ? err.message : "Internal server error",
      status: 500,
    });
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.name) {
      return sendResponse({
        success: false,
        message: "Role name is required",
        status: 400,
      });
    }

    const updated = await prisma.role.update({
      where: { idRole: parseInt(id) },
      data: { name: body.name },
    });

    return sendResponse({
      success: true,
      message: "Role updated successfully",
      data: updated,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    await prisma.role.delete({
      where: { idRole: parseInt(id) },
    });

    return sendResponse({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
