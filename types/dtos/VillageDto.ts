import { SubDistrictDto } from "./SubDistrictDto";

export interface VillageDto {
  id: string;
  name: string;
  code: string;
  subDistrictId: string;
  subDistrict: SubDistrictDto;
}
