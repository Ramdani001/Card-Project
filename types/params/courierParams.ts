export interface CreateCourierParams {
  courierCode: string;
  description?: string | null;
  status: boolean;
}

export interface UpdateCourierParams {
  id: string;
  courierCode: string;
  description?: string | null;
  status: boolean;
}
