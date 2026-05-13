export interface CreateApiEndpointParams {
  url: string;
  description?: string;
}

export interface UpdateApiEndpointParams {
  id: string;
  url?: string;
  description?: string;
}
