export interface Event {
  id: string;
  title: string;
  slug: string;
  content: string;
  startDate: string;
  endDate: string;
  images: {
    id: string;
    url: string;
  }[];
}
