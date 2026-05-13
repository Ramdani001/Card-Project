export interface CreateVillageParams {
  name: string;
  code: string;
  subDistrictId: string;
}

export interface UpdateVillageParams {
  name?: string;
  code?: string;
  subDistrictId?: string;
}
