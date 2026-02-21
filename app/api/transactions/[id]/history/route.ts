import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { authOptions } from "@/lib/auth";
import { getHistoryTransactions } from "@/services/transaction/transaction.service";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const GET = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendResponse({ success: false, message: "Unauthorized", status: 401 });
    }

    const { options, page, limit } = getQueryPaginationOptions(req);

    const { id } = await params;
    const { logs, total } = await getHistoryTransactions(id, options);

    return sendResponse({
      success: true,
      message: "Transaction history fetched",
      data: logs,
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
