export interface CardData {
  id: string;
  name: string;
  slug?: string;
  price: number;
  stock: number;
  sku?: string;
  discountId?: string;
  description?: string;
  images: { id: string; url: string; isPrimary: boolean }[];
  categories: {
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
}
