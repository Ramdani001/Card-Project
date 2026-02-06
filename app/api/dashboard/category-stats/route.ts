import { handleApiError, sendResponse } from "@/helpers/response.helper";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        tc.name as category,
        COUNT(ti."idTrxItem") as count,
        SUM(ti.subtotal) as total_revenue
      FROM "TransactionItem" ti
      JOIN "Transaction" t ON ti."idTrx" = t."idTrx"
      JOIN "Card" c ON ti."idCard" = c."idCard"
      JOIN "TypeCard" tc ON c."idTypeCard" = tc."idTypeCard"
      WHERE t.status IN ('PAID', 'SENT', 'COMPLETED')
      GROUP BY tc.name
    `;

    const formatted = (result as any[]).map((item) => ({
      name: item.category,
      value: Number(item.total_revenue),
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
