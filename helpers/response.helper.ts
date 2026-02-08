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
          message: `Duplicate entry: Data with this ${target} already exists.`,
          status: 409,
          error: { code: err.code, target },
        });

      case "P2025":
        return sendResponse({
          success: false,
          message: "Data not found. It may have been deleted or never existed.",
          status: 404, // Not Found
          error: { code: err.code },
        });

      case "P2003":
        return sendResponse({
          success: false,
          message: "Cannot delete or update this data because it is currently used/referenced by other records (e.g., Transactions, History).",
          status: 409,
          error: { code: err.code, detail: err.meta?.field_name },
        });

      case "P2001":
        return sendResponse({
          success: false,
          message: "The record searched for in the where condition does not exist.",
          status: 404,
          error: { code: err.code },
        });

      default:
        return sendResponse({
          success: false,
          message: `Database operation failed (Code: ${err.code})`,
          status: 400,
          error: { code: err.code, meta: err.meta },
        });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return sendResponse({
      success: false,
      message: "Invalid data format provided. Please check your input fields.",
      status: 400,
      error: {
        detail: process.env.NODE_ENV === "development" ? err.message : "Validation Error",
      },
    });
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return sendResponse({
      success: false,
      message: "Failed to connect to the database server.",
      status: 500,
      error: { code: err.errorCode },
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
