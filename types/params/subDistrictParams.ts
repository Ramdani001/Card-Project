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

export type SubDistrictApiResponse = {
  data: {
    code: string;
    name: string;
    regency_code: string;
  }[];
};
