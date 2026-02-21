import { CardImageDto } from "./CardImageDto";
import { DiscountDto } from "./DiscountDto";

export interface CardDetailDto {
  idDetail?: number;
  name?: string;
  price?: number;
  stock?: number;
  note?: string;
  image?: CardImageDto;
  discount?: DiscountDto | null;
}
