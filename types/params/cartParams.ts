export interface AddToCartParams {
  userId: string;
  cardId: string;
  quantity: number;
}

export interface UpdateCartItemParams {
  itemId: string;
  quantity: number;
}