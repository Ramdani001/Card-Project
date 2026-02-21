import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { Prisma } from "@/prisma/generated/prisma/client";
import { createRoleCategoryAccess, getRoleCategoryAccesses } from "@/services/master/cardCategoryRoleAccess.service";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);

    const searchParams = req.nextUrl.searchParams;
    const roleId = searchParams.get("roleId");
    const categoryId = searchParams.get("categoryId");

    const additionalWhere: Prisma.CardCategoryRoleAccessWhereInput = {};
    if (roleId) additionalWhere.roleId = roleId;
    if (categoryId) additionalWhere.categoryId = categoryId;

    const finalOptions = {
      ...options,
      where: { ...options.where, ...additionalWhere },
    };

    const { accesses, total } = await getRoleCategoryAccesses(finalOptions);

    return sendResponse({
      success: true,
      message: "Role Category Access fetched successfully",
      data: accesses,
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
    const { roleId, categoryId } = body;

    if (!roleId || !categoryId) {
      return sendResponse({ success: false, message: "roleId and categoryId are required", status: 400 });
    }

    const newAccess = await createRoleCategoryAccess(roleId, categoryId);

    return sendResponse({
      success: true,
      message: "Role Category Access created successfully",
      data: newAccess,
    });
  } catch (err) {
    return handleApiError(err);
  }
};
