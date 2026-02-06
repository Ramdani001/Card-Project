import { handleApiError, sendResponse } from "@/helpers/response.helper";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const USER_ID = 1;

export async function GET() {
  try {
    const cart = await prisma.cart.findUnique({
      where: { idUsr: USER_ID },
      include: {
        items: {
          include: {
            card: { include: { detail: { include: { image: true } } } },
          },
        },
      },
    });

    if (!cart)
      return sendResponse({
        success: true,
        message: "Cart fetched successfully",
        data: { items: [] },
      });

    const formattedItems = cart.items.map((item) => ({
      idCartItem: item.idCartItem,
      idCard: item.idCard,
      name: item.card.detail.name,
      price: item.card.detail.price,
      quantity: item.quantity,
      subtotal: item.card.detail.price * item.quantity,
      image: item.card.detail.image,
    }));

    return sendResponse({
      success: true,
      message: "Cart fetched successfully",
      data: formattedItems,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idCard, quantity } = body;
    const cardIdNum = Number(idCard);

    if (!quantity || quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }

    const productExists = await prisma.card.findUnique({
      where: { idCard: cardIdNum },
      select: {
        detail: true,
      },
    });

    if (!productExists) {
      throw new Error("Card not found");
    }

    let cart = await prisma.cart.findUnique({ where: { idUsr: USER_ID } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { idUsr: USER_ID } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        idCart_idCard: {
          idCart: cart.idCart,
          idCard: cardIdNum,
        },
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { idCartItem: existingItem.idCartItem },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          idCart: cart.idCart,
          idCard: cardIdNum,
          quantity: quantity,
        },
      });
    }

    return sendResponse({
      success: true,
      message: "Successfully added to cart",
    });
  } catch (err) {
    return handleApiError(err);
  }
}
