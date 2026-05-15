export interface CreateUserParams {
  name: string;
  email: string;
  password: string;
  phone?: string;
  roleId?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  address?: string;
  countryIsoCode?: string;
  provinceCode?: string;
  cityCode?: string;
  subDistrictCode?: string;
  villageCode?: string;
  postalCode?: string;
  file?: File | null;
}

export interface UpdateUserParams {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  roleId?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  address?: string;
  countryIsoCode?: string;
  provinceCode?: string;
  cityCode?: string;
  subDistrictCode?: string;
  villageCode?: string;
  postalCode?: string;
  file?: File | null;
}
