import { CardData } from "./CardData";

export interface CartItem {
  idCartItem: number;
  idCard: number;
  quantity: number;
  card: CardData;
}
