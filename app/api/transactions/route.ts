import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@/prisma/generated/prisma/client";
import { getTransactions } from "@/services/transaction/transaction.service";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendResponse({ success: false, message: "Unauthorized", status: 401 });
    }

    const { options, page, limit } = getQueryPaginationOptions(req);

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const additionalWhere: Prisma.TransactionWhereInput = {};

    if (status) {
      additionalWhere.status = status as any;
    }

    if (search) {
      additionalWhere.OR = [
        { invoice: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        {
          user: {
            name: { contains: search, mode: "insensitive" },
          },
        },
        {
          items: {
            some: {
              OR: [
                { productName: { contains: search, mode: "insensitive" } },
                {
                  card: {
                    name: { contains: search, mode: "insensitive" },
                  },
                },
              ],
            },
          },
        },
      ];
    }

    if (startDate || endDate) {
      additionalWhere.createdAt = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      };
    }

    const { transactions, total } = await getTransactions({
      ...options,
      where: additionalWhere,
    });

    return sendResponse({
      success: true,
      message: "Transaction history fetched",
      data: transactions,
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
