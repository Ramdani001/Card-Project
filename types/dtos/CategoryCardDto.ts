export interface CategoryCardDto {
  id: string;
  name: string;
  slug: string;
  note?: string | null;
  urlImage?: string | null;
  pathImage?: string | null;
  _count?: {
    cards: number;
  };
}
