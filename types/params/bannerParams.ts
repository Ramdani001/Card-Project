export interface CreateBannerParams {
  link?: string | null;
  startDate: Date;
  endDate: Date;
  file: File;
}

export interface UpdateBannerParams {
  id: string;
  link?: string | null;
  startDate?: Date;
  endDate?: Date;
  file?: File | null;
}
