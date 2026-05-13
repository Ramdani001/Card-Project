export interface CreateCategoryParams {
  name: string;
  note?: string;
  file?: File | null;
}

export interface UpdateCategoryParams {
  id: string;
  name?: string;
  note?: string;
  file?: File | null;
}
