import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { createVillage, getVillages } from "@/services/master/village.service";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);
    const { villages, total } = await getVillages(options);

    return sendResponse({
      success: true,
      message: "Villages fetched successfully",
      data: villages,
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
    const { name, code, subDistrictId } = body;

    const newVillage = await createVillage({
      name,
      code,
      subDistrictId,
    });

    return sendResponse({
      success: true,
      message: "Village created successfully",
      data: newVillage,
      status: 201,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
