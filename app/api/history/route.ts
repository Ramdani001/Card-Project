import { getAuthUser } from "@/helpers/auth.server";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getAuthUser();

    const history = await prisma.transaction.findMany({
      where: { idUsr: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            card: { include: { detail: true } },
          },
        },
      },
    });

    const data = history.map((trx: any) => ({
      id: trx.idTrx,
      date: trx.createdAt,
      status: trx.status,
      total: trx.totalAmount,
      items: trx.items.map((item: any) => ({
        name: item.card.detail.name,
        qty: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      })),
    }));

    return sendResponse({
      success: true,
      message: "History transaction",
      data,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
