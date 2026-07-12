import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { createCourier, getCouriers } from "@/services/master/courier.service";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);
    const { couriers, total } = await getCouriers(options);

    return sendResponse({
      success: true,
      message: "Couriers fetched successfully",
      data: couriers,
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

    const { courierCode, status, description } = body;

    const newCourier = await createCourier({
      courierCode,
      status,
      description,
    });

    return sendResponse({
      success: true,
      message: "Courier created successfully",
      data: newCourier,
      status: 201,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
