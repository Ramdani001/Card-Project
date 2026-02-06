import { handleApiError, sendResponse } from "@/helpers/response.helper";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        TO_CHAR("createdAt", 'YYYY-MM-DD') as date, 
        SUM("totalAmount") as total
      FROM "Transaction"
      WHERE "status" IN ('PAID', 'SENT', 'COMPLETED')
      AND "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
      ORDER BY date ASC;
    `;

    const chartData = (result as any[]).map((item) => ({
      date: item.date,
      revenue: Number(item.total),
    }));

    return sendResponse({
      success: true,
      message: "Success",
      data: chartData,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
