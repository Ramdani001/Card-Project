export interface CreateArticleParams {
  title: string;
  content: string;
  files: File[];
}

export interface UpdateArticleParams {
  id: string;
  title?: string;
  content?: string;
  files?: File[];
  removedImageIds: string[];
}