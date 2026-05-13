export interface CreateShopParams {
  name: string;
  address: string;
}

export interface UpdateShopParams {
  id: string;
  name?: string;
  address?: string;
}