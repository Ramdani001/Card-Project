import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError, sendResponse } from "@/helpers/response.helper";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const idMenu = parseInt(id);

    if (isNaN(idMenu)) {
      return sendResponse({ success: false, message: "Invalid ID", status: 400 });
    }

    const menu = await prisma.menu.findUnique({
      where: { idMenu },
      include: {
        subMenus: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!menu) {
      return sendResponse({
        success: false,
        message: "Menu not found",
        status: 404,
      });
    }

    return sendResponse({
      success: true,
      message: "Menu detail fetched successfully",
      data: menu,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const idMenu = parseInt(id);

    if (isNaN(idMenu)) {
      return sendResponse({ success: false, message: "Invalid ID", status: 400 });
    }

    const body = await req.json();
    const { code, label, url, icon, order, parentCode } = body;

    const existingMenu = await prisma.menu.findUnique({
      where: { idMenu },
    });

    if (!existingMenu) {
      return sendResponse({ success: false, message: "Menu not found", status: 404 });
    }

    if (parentCode) {
      if (parentCode === existingMenu.code) {
        return sendResponse({
          success: false,
          message: "A menu cannot be its own parent",
          status: 400,
        });
      }

      const parentExists = await prisma.menu.findUnique({
        where: { code: parentCode },
      });

      if (!parentExists) {
        return sendResponse({
          success: false,
          message: `Parent menu with code '${parentCode}' not found`,
          status: 400,
        });
      }
    }

    const updated = await prisma.menu.update({
      where: { idMenu },
      data: {
        ...(code && { code }),
        ...(label && { label }),

        ...(url !== undefined ? { url: url || null } : {}),
        ...(icon !== undefined ? { icon: icon || null } : {}),

        ...(order !== undefined && { order }),

        ...(parentCode !== undefined ? { parentCode: parentCode || null } : {}),
      },
    });

    return sendResponse({
      success: true,
      message: "Menu updated successfully",
      data: updated,
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      return sendResponse({
        success: false,
        message: "Menu code must be unique",
        status: 409,
      });
    }
    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const idMenu = parseInt(id);

    if (isNaN(idMenu)) {
      return sendResponse({ success: false, message: "Invalid ID", status: 400 });
    }

    const hasChildren = await prisma.menu.findFirst({
      where: { parentCode: (await prisma.menu.findUnique({ where: { idMenu } }))?.code },
    });

    if (hasChildren) {
      return sendResponse({
        success: false,
        message: "Cannot delete this menu because it has sub-menus attached. Please delete/move the sub-menus first.",
        status: 400,
      });
    }

    await prisma.menu.delete({
      where: { idMenu },
    });

    return sendResponse({
      success: true,
      message: "Menu deleted successfully",
    });
  } catch (err: any) {
    if (err.code === "P2003") {
      return sendResponse({
        success: false,
        message: "Cannot delete this menu because it is referenced by other data.",
        status: 409,
      });
    }
    return handleApiError(err);
  }
};
