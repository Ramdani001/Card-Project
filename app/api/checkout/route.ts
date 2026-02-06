import { handleApiError, sendResponse } from "@/helpers/response.helper";
import prisma from "@/lib/prisma";

const USER_ID = 1;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentMethod, address } = body;

    if (!paymentMethod || !address) {
      throw new Error("Payment method and address are required");
    }

    const result = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { idUsr: USER_ID },
        include: {
          items: {
            include: { card: { include: { detail: true } } },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new Error("Cart is empty");
      }

      let totalAmount = 0;
      const transactionItemsData = [];

      for (const item of cart.items) {
        const productDetail = item.card.detail;

        if (productDetail.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${productDetail.name}. Only ${productDetail.stock} left.`);
        }

        const subtotal = productDetail.price * item.quantity;
        totalAmount += subtotal;

        transactionItemsData.push({
          idCard: item.idCard,
          quantity: item.quantity,
          price: productDetail.price,
          subtotal: subtotal,
        });

        await tx.detailCard.update({
          where: { idDetail: productDetail.idDetail },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      const newTransaction = await tx.transaction.create({
        data: {
          idUsr: USER_ID,
          totalAmount: totalAmount,
          status: "PAID",
          paymentMethod: paymentMethod,
          snapAddress: address,
          items: {
            create: transactionItemsData,
          },
        },
      });

      await tx.cartItem.deleteMany({
        where: { idCart: cart.idCart },
      });

      return newTransaction;
    });

    return sendResponse({
      success: true,
      message: "Transaction successful",
      data: {
        transactionId: result.idTrx,
        totalAmount: result.totalAmount,
        status: result.status,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
