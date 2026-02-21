import { DiscountTypeDto } from "./DiscountDto";

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
  createdAt: string | Date;
  updatedAt: string | Date;
}
