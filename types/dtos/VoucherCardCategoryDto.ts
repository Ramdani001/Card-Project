import { CategoryCardDto } from "./CategoryCardDto";

export interface VoucherCardCategoryDto {
  id: string;
  voucherId: string;
  cardCategoryId: string;
  cardCategory: CategoryCardDto;
  createdAt: string | Date;
  updatedAt: string | Date;
}
