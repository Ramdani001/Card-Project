export interface CreateShopParams {
  name: string;
  address: string;
  isMainShop: boolean;
  countryIsoCode: string;
  provinceCode: string;
  cityCode: string;
  subDistrictCode: string;
  villageCode: string;
  postalCode: string;
}

export interface UpdateShopParams {
  id: string;
  name?: string;
  address?: string;
  isMainShop?: boolean;
  countryIsoCode?: string;
  provinceCode?: string;
  cityCode?: string;
  subDistrictCode?: string;
  villageCode?: string;
  postalCode?: string;
}
