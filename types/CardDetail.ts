import { CardDiscount } from "./CardDiscount";
import { CardImage } from "./CardImage";

export interface CardDetail {
  idDetail?: number;
  name?: string;
  price?: number;
  stock?: number;
  note?: string;
  image?: CardImage;
  discount?: CardDiscount | null;
}
