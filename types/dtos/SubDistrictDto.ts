import { CityDto } from "./CitytDto";

export interface SubDistrictDto {
  id: string;
  name: string;
  code: string;
  cityId: string;
  city: CityDto;
}
