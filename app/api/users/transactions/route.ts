import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@/prisma/generated/prisma/client";
import { getUserTransactions } from "@/services/transaction/transaction.service";
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
    const invoice = searchParams.get("invoice");

    const additionalWhere: Prisma.TransactionWhereInput = {};

    if (status) {
      additionalWhere.status = status as any;
    }

    if (invoice) {
      additionalWhere.invoice = { contains: invoice, mode: "insensitive" };
    }

    const { transactions, total } = await getUserTransactions(session.user.id, {
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
