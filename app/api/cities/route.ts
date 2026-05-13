import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { createCity, getCities } from "@/services/master/city.service";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);
    const { cities, total } = await getCities(options);

    return sendResponse({
      success: true,
      message: "Cities fetched successfully",
      data: cities,
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
    const { name, code, provinceId } = body;

    const newCity = await createCity({
      name,
      code,
      provinceId,
    });

    return sendResponse({
      success: true,
      message: "City created successfully",
      data: newCity,
      status: 201,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
