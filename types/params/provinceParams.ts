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
