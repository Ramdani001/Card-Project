export interface CreateCityParams {
  name: string;
  code: string;
  provinceId: string;
}

export interface UpdateCityParams {
  name?: string;
  code?: string;
  provinceId?: string;
}
