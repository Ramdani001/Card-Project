import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { syncRoleCategoryAccess } from "@/services/cardCategoryRoleAccess.service";
import { NextRequest } from "next/server";

export const PATCH = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { roleId, categoryIds } = body;

    if (!roleId || !Array.isArray(categoryIds)) {
      return sendResponse({
        success: false,
        message: "roleId and categoryIds (as an array) are required",
        status: 400,
      });
    }

    const syncedAccess = await syncRoleCategoryAccess(roleId, categoryIds);

    return sendResponse({
      success: true,
      message: "Role Category Access synchronized successfully",
      data: syncedAccess,
    });
  } catch (err) {
    return handleApiError(err);
  }
};
