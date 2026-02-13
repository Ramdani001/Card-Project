import { NextRequest } from "next/server";
import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { createMenu, getMenus } from "@/services/menu.service";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);
    const { menus, total } = await getMenus(options);

    return sendResponse({
      success: true,
      message: "Menus fetched successfully",
      data: menus,
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
    const { label, url, icon, order, parentId } = body;

    if (!label) {
      return sendResponse({ success: false, message: "Label is required", status: 400 });
    }

    const newMenu = await createMenu({
      label,
      url,
      icon,
      order: order ? Number(order) : 0,
      parentId,
    });

    return sendResponse({
      success: true,
      message: "Menu created successfully",
      data: newMenu,
      status: 201,
    });
  } catch (err: any) {
    if (err.message === "Parent menu not found") {
      return sendResponse({ success: false, message: err.message, status: 400 });
    }
    return handleApiError(err);
  }
};
