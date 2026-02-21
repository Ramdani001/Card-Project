export interface CategoryCardDto {
  id: string;
  name: string;
  slug: string;
  note?: string | null;
  _count?: {
    cards: number;
  };
}
