import { CardData } from "./CardData";

export interface CartItem {
  id: string;
  cartId: string;
  cardId: string;
  quantity: number;
  createdAt: string;
  card: CardData;
}
