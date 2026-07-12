export interface CreateCourierParams {
  courierCode: string;
  status: boolean;
}

export interface UpdateCourierParams {
  id: string;
  courierCode: string;
  status: boolean;
}
