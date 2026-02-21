import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { authOptions } from "@/lib/auth";
import { addToCart, clearCart, getCartByUserId } from "@/services/transaction/cart.service";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export const GET = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendResponse({ success: false, message: "Unauthorized", status: 401 });
    }

    const cart = await getCartByUserId(session.user.id);

    return sendResponse({
      success: true,
      message: "Cart fetched successfully",
      data: cart,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendResponse({ success: false, message: "Unauthorized", status: 401 });
    }

    const body = await req.json();
    const { cardId, quantity } = body;

    if (!cardId || !quantity) {
      return sendResponse({ success: false, message: "Card ID and Quantity are required", status: 400 });
    }

    const result = await addToCart({
      userId: session.user.id,
      cardId: cardId,
      quantity: Number(quantity),
    });

    return sendResponse({
      success: true,
      message: "Item added to cart",
      data: result,
      status: 201,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const DELETE = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendResponse({ success: false, message: "Unauthorized", status: 401 });
    }

    await clearCart(session.user.id);

    return sendResponse({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (err) {
    return handleApiError(err);
  }
};
