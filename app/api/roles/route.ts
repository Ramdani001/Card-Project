import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);

    if (options.take) {
      const [roles, total] = await Promise.all([
        prisma.role.findMany({
          ...options,
        }),
        prisma.role.count(),
      ]);

      return sendResponse({
        success: true,
        message: "All roles fetched successfully",
        data: roles,
        metadata: {
          total,
          page: page || 1,
          limit: limit || 10,
          totalPages: Math.ceil(total / (limit || 10)),
        },
      });
    }

    const allRoles = await prisma.role.findMany({
      ...options,
      orderBy: options.orderBy || { idRole: "asc" },
    });

    return sendResponse({
      success: true,
      message: "All roles fetched successfully",
      data: allRoles,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    if (!body.name) {
      return sendResponse({
        success: false,
        message: "Role name is required",
        status: 400,
      });
    }

    const newRole = await prisma.role.create({
      data: { name: body.name },
    });

    return sendResponse({
      success: true,
      message: "Role created successfully",
      data: newRole,
      status: 201,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
