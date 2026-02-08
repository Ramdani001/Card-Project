import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);

    const queryOptions: any = {
      ...options,
      include: {
        subMenus: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: options.orderBy || { order: "asc" },
    };

    if (options.take) {
      const countOptions = { where: options.where };

      const [menus, total] = await Promise.all([prisma.menu.findMany(queryOptions), prisma.menu.count(countOptions)]);

      return sendResponse({
        success: true,
        message: "Menus fetched successfully",
        data: menus,
        metadata: {
          total,
          page: page || 1,
          limit: limit || 10,
          totalPages: Math.ceil(total / (limit || 10)),
        },
      });
    }

    const allMenus = await prisma.menu.findMany(queryOptions);

    return sendResponse({
      success: true,
      message: "All menus fetched successfully",
      data: allMenus,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const { code, label, url, icon, order, parentCode } = body;

    if (!code || !label) {
      return sendResponse({
        success: false,
        message: "Code and Label are required",
        status: 400,
      });
    }

    const existingMenu = await prisma.menu.findUnique({
      where: { code },
    });

    if (existingMenu) {
      return sendResponse({
        success: false,
        message: `Menu with code '${code}' already exists`,
        status: 409,
      });
    }

    if (parentCode) {
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

    const newMenu = await prisma.menu.create({
      data: {
        code,
        label,
        url: url || null,
        icon: icon || null,
        order: order || 0,
        parentCode: parentCode || null,
      },
    });

    return sendResponse({
      success: true,
      message: "Menu created successfully",
      data: newMenu,
      status: 201,
    });
  } catch (err) {
    return handleApiError(err);
  }
};
