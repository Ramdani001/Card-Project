import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError, sendResponse } from "@/helpers/response.helper";

export async function GET() {
  try {
    const recentTrx = await prisma.transaction.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { email: true },
        },
      },
    });

    const formatted = recentTrx.map((trx) => ({
      id: trx.idTrx,
      user: trx.user.email,
      total: trx.totalAmount,
      status: trx.status,
      date: trx.createdAt,
    }));

    return sendResponse({
      success: true,
      message: "Success",
      data: formatted,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
