import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { deleteRoleCategoryAccess, getRoleCategoryAccessById, updateRoleCategoryAccess } from "@/services/master/cardCategoryRoleAccess.service";
import { NextRequest } from "next/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const GET = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const access = await getRoleCategoryAccessById(id);

    if (!access) return sendResponse({ success: false, message: "Access record not found", status: 404 });

    return sendResponse({ success: true, data: access, message: "Fetch Role Category Access successfully" });
  } catch (error) {
    return handleApiError(error);
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { roleId, categoryId } = body;

    const updatedAccess = await updateRoleCategoryAccess(id, { roleId, categoryId });

    return sendResponse({
      success: true,
      message: "Role Category Access updated successfully",
      data: updatedAccess,
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export const DELETE = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    await deleteRoleCategoryAccess(id);

    return sendResponse({
      success: true,
      message: "Role Category Access deleted (soft) successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
};
