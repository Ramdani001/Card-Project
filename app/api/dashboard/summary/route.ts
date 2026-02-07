import { handleApiError, sendResponse } from "@/helpers/response.helper";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [totalRevenue, totalTransactions, lowStockCount, activeUserCount] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ["PAID", "SENT", "COMPLETED"] } },
      }),

      prisma.transaction.count({
        where: { status: { in: ["PAID", "SENT", "COMPLETED"] } },
      }),

      prisma.detailCard.count({
        where: { stock: { lt: 5 } },
      }),

      prisma.transaction
        .groupBy({
          by: ["idUsr"],
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        })
        .then((res) => res.length),
    ]);

    return sendResponse({
      success: true,
      message: "Success",
      data: {
        revenue: totalRevenue._sum.totalAmount || 0,
        transactions: totalTransactions,
        lowStock: lowStockCount,
        activeUsers: activeUserCount,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
