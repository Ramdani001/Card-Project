import prisma from "@/lib/prisma";
import { sendResponse, handleApiError } from "@/helpers/response.helper";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idCartItem = Number(id);

    const body = await request.json();
    const { quantity } = body;

    if (!quantity || quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }

    const currentItem = await prisma.cartItem.findUnique({
      where: { idCartItem: idCartItem },
      include: {
        card: {
          include: { detail: true },
        },
      },
    });

    if (!currentItem) {
      throw new Error("Item not found");
    }

    const updatedItem = await prisma.cartItem.update({
      where: { idCartItem: idCartItem },
      data: {
        quantity: quantity,
      },
    });

    return sendResponse({
      success: true,
      message: "Cart updated successfully",
      data: updatedItem,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idCartItem = Number(id);

    await prisma.cartItem.delete({
      where: { idCartItem },
    });

    return sendResponse({
      success: true,
      message: "Item removed successfully",
    });
  } catch (err) {
    return handleApiError(err);
  }
}
