import { NextRequest } from "next/server";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { deleteMenu, getMenuById, updateMenu } from "@/services/menu.service";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const menu = await getMenuById(id);

    if (!menu) return sendResponse({ success: false, message: "Menu not found", status: 404 });

    return sendResponse({
      success: true,
      message: "Menu fetched successfully",
      data: menu,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const body = await req.json();

    const payload = {
      ...body,
      order: body.order !== undefined ? Number(body.order) : undefined,
    };

    const updatedMenu = await updateMenu({
      id,
      ...payload,
    });

    return sendResponse({
      success: true,
      message: "Menu updated successfully",
      data: updatedMenu,
    });
  } catch (err: any) {
    if (err.message === "Menu not found") return sendResponse({ success: false, message: err.message, status: 404 });
    if (err.message === "Menu cannot be its own parent") return sendResponse({ success: false, message: err.message, status: 400 });
    if (err.message === "Parent menu not found") return sendResponse({ success: false, message: err.message, status: 400 });

    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    await deleteMenu(id);
    return sendResponse({ success: true, message: "Menu deleted successfully" });
  } catch (err: any) {
    if (err.message === "Menu not found") return sendResponse({ success: false, message: err.message, status: 404 });
    return handleApiError(err);
  }
};
