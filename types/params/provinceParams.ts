export interface CreateProvinceParams {
  name: string;
  code: string;
  countryId: string;
}

export interface UpdateProvinceParams {
  name?: string;
  code?: string;
  countryId?: string;
}

export type ProvinceApiResponse = {
  data: {
    code: string;
    name: string;
  }[];
  meta: {
    administrative_area_level: number;
    updated_at: string;
  };
};
