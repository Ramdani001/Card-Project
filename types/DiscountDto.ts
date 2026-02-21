export interface DiscountDto {
  id: string;
  name: string;
  value: number;
  type: DiscountTypeDto;
}

export type DiscountTypeDto = "NOMINAL" | "PERCENTAGE";
