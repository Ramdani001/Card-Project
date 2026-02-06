import { handleApiError, sendResponse } from "@/helpers/response.helper";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        d.name as name, 
        SUM(ti.quantity) as sold,
        SUM(ti.subtotal) as revenue,
        d.stock as stock
      FROM "TransactionItem" ti
      JOIN "Transaction" t ON ti."idTrx" = t."idTrx"
      JOIN "Card" c ON ti."idCard" = c."idCard"
      JOIN "DetailCard" d ON c."idDetail" = d."idDetail"
      WHERE t.status IN ('PAID', 'SENT', 'COMPLETED')
      GROUP BY d.name, d.stock
      ORDER BY sold DESC
      LIMIT 5;
    `;

    const formatted = (result as any[]).map((item) => ({
      name: item.name,
      sold: Number(item.sold),
      revenue: Number(item.revenue),
      stock: item.stock,
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
