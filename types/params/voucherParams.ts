import { DiscountType, VoucherCard, VoucherCardCategory, VoucherRole, VoucherUsageCategory } from "@/prisma/generated/prisma/client";

export interface CreateVoucherParams {
  code: string;
  name: string;
  description?: string;
  type: DiscountType;
  usageCategory: VoucherUsageCategory;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  voucherCardCategories: VoucherCardCategory[];
  voucherCards: VoucherCard[];
  voucherRoles: VoucherRole[];
  stock?: number;
  startDate: Date | string;
  endDate: Date | string;
}

export interface UpdateVoucherParams {
  id: string;
  code?: string;
  name?: string;
  description?: string;
  type?: DiscountType;
  usageCategory?: VoucherUsageCategory;
  value?: number;
  minPurchase?: number;
  maxDiscount?: number;
  voucherCardCategories: VoucherCardCategory[];
  voucherCards: VoucherCard[];
  voucherRoles: VoucherRole[];
  stock?: number;
  startDate?: Date | string;
  endDate?: Date | string;
}
