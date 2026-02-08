export interface EventImage {
  idImage: number;
  name: string;
  location: string;
  idEvent: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Event {
  idEvent: number;
  title: string;
  content: string;

  startDate: string | Date;
  endDate: string | Date;

  createdAt: string | Date;
  updatedAt: string | Date;

  images?: EventImage[];
}
