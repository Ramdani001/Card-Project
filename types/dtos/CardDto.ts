import { CategoryCardDto } from "./CategoryCardDto";
import { DiscountDto } from "./DiscountDto";

export interface CardDto {
  id: string;
  name: string;
  slug?: string;
  price: number;
  stock: number;
  sku?: string;
  discountId?: string;
  discount?: DiscountDto;
  minQtyPurchase?: number | null;
  maxQtyPurchase?: number | null;
  description?: string;
  weight: number;
  images: { id: string; url: string; isPrimary: boolean }[];
  categories: {
    category: CategoryCardDto;
  }[];
}
