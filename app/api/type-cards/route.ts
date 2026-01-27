import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { sendResponse } from "@/helpers/response.helper";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);

    if (options.take) {
      const [typeCards, total] = await Promise.all([prisma.typeCard.findMany(options), prisma.typeCard.count()]);

      return sendResponse({
        success: true,
        message: "All type cards fetched successfully",
        data: typeCards,
        metadata: {
          total,
          page: page || 1,
          limit: limit || 10,
          totalPages: Math.ceil(total / (limit || 10)),
        },
      });
    }

    const allTypeCards = await prisma.typeCard.findMany({
      ...options,
      orderBy: options.orderBy || { name: "asc" },
    });

    return sendResponse({
      success: true,
      message: "All type cards fetched successfully",
      data: allTypeCards,
    });
  } catch (err) {
    console.error(err);
    return sendResponse({
      success: false,
      message: "Failed to fetch type cards",
      status: 500,
    });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const { name, note } = await req.json();

    if (!name) {
      return sendResponse({
        success: false,
        message: "Name is required",
        status: 400,
      });
    }

    const newTypeCard = await prisma.typeCard.create({
      data: {
        name,
        note,
      },
    });

    return sendResponse({
      success: true,
      message: "Type card created successfully",
      data: newTypeCard,
      status: 201,
    });
  } catch (err) {
    console.error(err);
    return sendResponse({
      success: false,
      message: "Failed to save type card",
      status: 400,
    });
  }
};
