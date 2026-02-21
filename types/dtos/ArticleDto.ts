export interface ArticleDto {
  id: string;
  title: string;
  slug: string;
  content: string;
  images: {
    id: string;
    url: string;
  }[];
}
