import { sendResponse, handleApiError } from "@/helpers/response.helper";
import { authOptions } from "@/lib/auth";
import { batchCancelTransactions } from "@/services/transaction/transaction.service"; // 🛠️ Pastikan path import service transaksi Anda benar
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export const PATCH = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return sendResponse({
        success: false,
        message: "Unauthorized",
        status: 401,
      });
    }

    const body = await req.json();
    const { ids, note } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return sendResponse({
        success: false,
        message: "Array of Transaction IDs is required",
        status: 400,
      });
    }

    const result = await batchCancelTransactions(ids, { note, userId: session.user.id });

    return sendResponse({
      success: true,
      message: result.message,
      data: result,
      status: 200,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
