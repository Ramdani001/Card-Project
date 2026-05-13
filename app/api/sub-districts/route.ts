import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { createSubDistrict, getSubDistricts } from "@/services/master/subDistrict.service";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);
    const { subDistricts, total } = await getSubDistricts(options);

    return sendResponse({
      success: true,
      message: "Sub Districts fetched successfully",
      data: subDistricts,
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
    const { name, code, cityId } = body;

    const newSubDistrict = await createSubDistrict({
      name,
      code,
      cityId,
    });

    return sendResponse({
      success: true,
      message: "SubDistrict created successfully",
      data: newSubDistrict,
      status: 201,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
