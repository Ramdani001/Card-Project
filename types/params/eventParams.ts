export interface CreateEventParams {
  title: string;
  content: string;
  startDate: Date;
  endDate: Date;
  files: File[];
}

export interface UpdateEventParams {
  id: string;
  title?: string;
  content?: string;
  startDate?: Date;
  endDate?: Date;
  files?: File[];
  removedImageIds: string[];
}
