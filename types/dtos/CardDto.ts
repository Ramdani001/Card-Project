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
  description?: string;
  images: { id: string; url: string; isPrimary: boolean }[];
  categories: {
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
}
