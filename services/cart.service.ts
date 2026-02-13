import prisma from "@/lib/prisma";

interface AddToCartParams {
  userId: string;
  cardId: string;
  quantity: number;
}

interface UpdateCartItemParams {
  itemId: string;
  quantity: number;
}

export const getCartByUserId = async (userId: string) => {
  const cart = await prisma.cart.findFirst({
    where: { userId, isActive: true },
    include: {
      items: {
        orderBy: { createdAt: "desc" },
        include: {
          card: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
              discount: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    return await prisma.cart.create({
      data: { userId },
      include: {
        items: { include: { card: true } },
      },
    });
  }

  return cart;
};

export const addToCart = async (params: AddToCartParams) => {
  const { userId, cardId, quantity } = params;

  const card = await prisma.card.findUnique({
    where: { id: cardId },
  });

  if (!card) throw new Error("Card not found");
  if (card.stock < quantity) throw new Error("Insufficient stock");

  let cart = await prisma.cart.findFirst({
    where: { userId, isActive: true },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_cardId: {
        cartId: cart.id,
        cardId: cardId,
      },
    },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (card.stock < newQuantity) throw new Error("Insufficient stock for total quantity");

    return await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });
  }

  return await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      cardId,
      quantity,
    },
  });
};

export const updateCartItem = async (params: UpdateCartItemParams) => {
  const { itemId, quantity } = params;

  if (quantity <= 0) {
    return await prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { card: true },
  });

  if (!item) throw new Error("Cart item not found");
  if (item.card.stock < quantity) throw new Error("Insufficient stock");

  return await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });
};

export const removeCartItem = async (itemId: string) => {
  return await prisma.cartItem.delete({
    where: { id: itemId },
  });
};

export const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findFirst({
    where: { userId, isActive: true },
  });

  if (!cart) return;

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return true;
};
