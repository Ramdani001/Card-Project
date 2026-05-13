export interface CreateSubDistrictParams {
  name: string;
  code: string;
  cityId: string;
}

export interface UpdateSubDistrictParams {
  name?: string;
  code?: string;
  cityId?: string;
}
