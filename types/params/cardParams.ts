export interface CreateCardParams {
  name: string;
  price: number;
  stock: number;
  categoryIds: string[];
  discountId?: string | null;
  description?: string;
  minQtyPurchase?: number | null;
  maxQtyPurchase?: number | null;
  primaryImageIndex: number;
  sku?: string;
  files: File[];
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
  keepImageIds: string[];
  files?: File[] | null;
  userId: string;
  primaryImageId?: string;
  primaryImageIndex?: number;
}
