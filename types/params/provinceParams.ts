export interface CreateProvinceParams {
  name: string;
  code: string;
  countryId: string;
}

export interface UpdateProvinceParams {
  id: string;
  name?: string;
  code?: string;
  countryId?: string;
}
