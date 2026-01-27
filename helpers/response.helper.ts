import { NextResponse } from "next/server";

export type BaseResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  metadata?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: any;
};

export const sendResponse = <T>({
  success,
  message,
  data,
  metadata,
  error,
  status = 200,
}: BaseResponse<T> & { status?: number }) => {
  return NextResponse.json(
    {
      success,
      message,
      data,
      metadata,
      error,
    },
    { status },
  );
};
