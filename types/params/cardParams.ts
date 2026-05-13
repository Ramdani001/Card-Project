export interface CreateCardParams {
  name: string;
  price: number;
  stock: number;
  categoryIds: string[];
  discountId?: string | null;
  description?: string;
  minQtyPurchase?: number | null;
  maxQtyPurchase?: number | null;
  sku?: string;
  file: File;
  userId: string;
}

export interface UpdateCardParams {
  id: string;
  name?: string;
  price?: number;
  stock?: number;
  categoryIds?: string[];
  discountId?: string | null;
  description?: string;
  minQtyPurchase?: number | null;
  maxQtyPurchase?: number | null;
  sku?: string;
  file?: File | null;
  userId: string;
}
