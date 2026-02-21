import { CardDto } from "./CardDto";

export interface CartItemDto {
  id: string;
  cartId: string;
  cardId: string;
  quantity: number;
  createdAt: string;
  card: CardDto;
}
