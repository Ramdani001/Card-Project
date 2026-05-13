import { DiscountType } from "@/prisma/generated/prisma/enums";

export interface CreateDiscountParams {
  name: string;
  value: number;
  type: DiscountType;
}

export interface UpdateDiscountParams {
  id: string;
  name?: string;
  value?: number;
  type?: DiscountType;
}
