export interface Discount {
  id: string;
  name: string;
  value: number;
  type: "NOMINAL" | "PERCENTAGE";
}
