import { DiscountTypeDto } from "./DiscountDto";
import { VoucherCardCategoryDto } from "./VoucherCardCategoryDto";
import { VoucherCardDto } from "./VoucherCardDto";
import { VoucherRoleDto } from "./VoucherRoleDto";

export interface VoucherDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: DiscountTypeDto;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  stock?: number;
  usedCount: number;
  startDate: string | Date;
  endDate: string | Date;
  voucherRoles: VoucherRoleDto[];
  voucherCards: VoucherCardDto[];
  voucherCardCategories: VoucherCardCategoryDto[];
  createdAt: string | Date;
  updatedAt: string | Date;
}
