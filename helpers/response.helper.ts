import { Prisma } from "@/app/generated/prisma/client";
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

export const sendResponse = <T>({ success, message, data, metadata, error, status = 200 }: BaseResponse<T> & { status?: number }) => {
  return NextResponse.json(
    {
      success,
      message,
      data,
      metadata,
      error,
    },
    { status }
  );
};

export const handleApiError = (err: any) => {
  console.error("API_ERROR_LOG:", err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        const target = (err.meta?.target as string[])?.join(", ") || "field";
        return sendResponse({
          success: false,
          message: `Duplicate entry: A record with this ${target} already exists.`,
          status: 409,
          error: { code: err.code, target },
        });

      case "P2025":
        return sendResponse({
          success: false,
          message: "The requested record was not found or has been deleted.",
          status: 404,
          error: { code: err.code },
        });

      case "P2003":
        return sendResponse({
          success: false,
          message: "Operation failed due to a related record constraint.",
          status: 400,
          error: { code: err.code },
        });

      default:
        return sendResponse({
          success: false,
          message: `Database error occurred (Code: ${err.code})`,
          status: 400,
        });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return sendResponse({
      success: false,
      message: "Invalid data format provided to the database schema.",
      status: 400,
    });
  }

  const isDev = process.env.NODE_ENV === "development";
  return sendResponse({
    success: false,
    message: err instanceof Error ? err.message : "An unexpected server error occurred.",
    status: 500,
    error: isDev ? err : undefined,
  });
};
