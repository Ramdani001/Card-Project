import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { createProvince, getProvincies } from "@/services/master/province.service";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);
    const { provincies, total } = await getProvincies(options);

    return sendResponse({
      success: true,
      message: "Provincies fetched successfully",
      data: provincies,
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
    const { name, code, countryId } = body;

    const newProvince = await createProvince({
      name,
      code,
      countryId,
    });

    return sendResponse({
      success: true,
      message: "Province created successfully",
      data: newProvince,
      status: 201,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
