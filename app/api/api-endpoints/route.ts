import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { createApiEndpoint, getApiEndpoints } from "@/services/apiEndpoint.service";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);

    const { apiEndpoitns, total } = await getApiEndpoints(options);

    return sendResponse({
      success: true,
      message: "Api Endpoints fetched successfully",
      data: apiEndpoitns,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { url, description } = body;

    const newDiscount = await createApiEndpoint({
      url,
      description,
    });

    return sendResponse({
      success: true,
      message: "Api Endpoints successfully",
      data: newDiscount,
      status: 201,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
