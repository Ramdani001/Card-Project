import { Prisma } from "@/prisma/generated/prisma/client";
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
type ApiErrorResponse = {
  success: false;
  message: string;
  error?: unknown;
};

const isDev = process.env.NODE_ENV === "development";

export function handleApiError(error: unknown) {
  console.error("API_ERROR_LOG:", error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        const target = (error.meta?.target as string[])?.join(", ") || "field";

        return NextResponse.json<ApiErrorResponse>(
          {
            success: false,
            message: `Duplicate entry: ${target} already exists.`,
            error: isDev
              ? {
                  code: error.code,
                  target,
                }
              : undefined,
          },
          { status: 409 }
        );
      }

      case "P2025":
        return NextResponse.json<ApiErrorResponse>(
          {
            success: false,
            message: "Data not found.",
            error: isDev
              ? {
                  code: error.code,
                }
              : undefined,
          },
          { status: 404 }
        );

      case "P2003":
        return NextResponse.json<ApiErrorResponse>(
          {
            success: false,
            message: "Cannot delete/update data because it is referenced by other records.",
            error: isDev
              ? {
                  code: error.code,
                  field: error.meta?.field_name,
                }
              : undefined,
          },
          { status: 409 }
        );

      case "P2001":
        return NextResponse.json<ApiErrorResponse>(
          {
            success: false,
            message: "Record does not exist.",
            error: isDev
              ? {
                  code: error.code,
                }
              : undefined,
          },
          { status: 404 }
        );

      default:
        return NextResponse.json<ApiErrorResponse>(
          {
            success: false,
            message: "Database operation failed.",
            error: isDev
              ? {
                  code: error.code,
                  meta: error.meta,
                }
              : undefined,
          },
          { status: 400 }
        );
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        message: "Invalid query or data format.",
        error: isDev ? error.message : undefined,
      },
      { status: 400 }
    );
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        message: "Database connection failed.",
        error: isDev
          ? {
              code: error.errorCode,
            }
          : undefined,
      },
      { status: 500 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        message: error.message,
        error: isDev ? error.stack : undefined,
      },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiErrorResponse>(
    {
      success: false,
      message: "Internal server error.",
    },
    { status: 500 }
  );
}
