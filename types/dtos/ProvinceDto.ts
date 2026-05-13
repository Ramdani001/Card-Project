import { CountryDto } from "./CountryDto";

export interface ProvinceDto {
  id: string;
  name: string;
  code: string;
  countryId: string;
  country: CountryDto;
}
