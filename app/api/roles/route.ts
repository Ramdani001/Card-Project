import { NextRequest } from "next/server";
import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { createRole, getRoles } from "@/services/role.service";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);

    const { roles, total } = await getRoles(options);

    return sendResponse({
      success: true,
      message: "Roles fetched successfully",
      data: roles,
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

    if (!body.name || typeof body.name !== "string") {
      return sendResponse({
        success: false,
        message: "Valid Role name is required",
        status: 400,
      });
    }

    const newRole = await createRole(body.name);

    return sendResponse({
      success: true,
      message: "Role created successfully",
      data: newRole,
      status: 201,
    });
  } catch (err: any) {
    if (err.message === "Role name already exists") {
      return sendResponse({ success: false, message: err.message, status: 409 });
    }
    return handleApiError(err);
  }
};
