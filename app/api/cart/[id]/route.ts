import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { removeCartItem, updateCartItem } from "@/services/transaction/cart.service";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendResponse({ success: false, message: "Unauthorized", status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { quantity } = body;

    if (quantity === undefined) {
      return sendResponse({ success: false, message: "Quantity is required", status: 400 });
    }

    const updatedItem = await updateCartItem({
      itemId: id,
      quantity: Number(quantity),
    });

    return sendResponse({
      success: true,
      message: "Cart item updated",
      data: updatedItem,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const DELETE = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendResponse({ success: false, message: "Unauthorized", status: 401 });
    }

    const { id } = await params;

    await removeCartItem(id);

    return sendResponse({
      success: true,
      message: "Item removed from cart",
    });
  } catch (err) {
    return handleApiError(err);
  }
};
