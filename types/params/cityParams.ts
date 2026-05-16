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

export type CityApiResponse = {
  data: {
    code: string;
    name: string;
    province_code: string;
  }[];
};
