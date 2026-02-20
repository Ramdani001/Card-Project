import { NextRequest } from "next/server";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { deleteRole, getRoleById, updateRole } from "@/services/role.service";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const role = await getRoleById(id);

    if (!role) return sendResponse({ success: false, message: "Role not found", status: 404 });

    return sendResponse({
      success: true,
      message: "Role fetched successfully",
      data: role,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    const body = await req.json();
    const { name, categoryIds, menuIds, apiAccesses } = body;

    const updatedRole = await updateRole({
      id,
      name: name || undefined,
      categoryIds: Array.isArray(categoryIds) ? categoryIds : undefined,
      menuIds: Array.isArray(menuIds) ? menuIds : undefined,
      apiAccesses: Array.isArray(apiAccesses) ? apiAccesses : undefined,
    });

    return sendResponse({
      success: true,
      message: "Role updated successfully",
      data: updatedRole,
    });
  } catch (err: any) {
    if (err.message === "Role not found") {
      return sendResponse({ success: false, message: err.message, status: 404 });
    }
    if (err.message === "Role name already exists") {
      return sendResponse({ success: false, message: err.message, status: 409 });
    }

    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    await deleteRole(id);
    return sendResponse({ success: true, message: "Role deleted successfully" });
  } catch (err: any) {
    if (err.message === "Role not found") return sendResponse({ success: false, message: err.message, status: 404 });
    if (err.message.includes("Cannot delete role")) return sendResponse({ success: false, message: err.message, status: 400 });
    return handleApiError(err);
  }
};
