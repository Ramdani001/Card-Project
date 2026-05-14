import { ProvinceDto } from "./ProvinceDto";

export interface CityDto {
  id: string;
  name: string;
  code: string;
  provinceId: string;
  province: ProvinceDto;
}
