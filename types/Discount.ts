export interface Discount {
  id: string;
  name: string;
  value: number;
  type: "NOMINAL" | "PERCENTAGE";
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
}
