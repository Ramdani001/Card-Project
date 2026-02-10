export interface CategoryCard {
  id: string;
  name: string;
  slug: string;
  note?: string | null;
  isActive: boolean;
  _count?: {
    cards: number;
  };
}
