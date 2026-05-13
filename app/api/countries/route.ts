import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { createCountry, getCountries } from "@/services/master/country.service";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);
    const { countries, total } = await getCountries(options);

    return sendResponse({
      success: true,
      message: "Countries fetched successfully",
      data: countries,
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
    const { name, isoCode } = body;

    const newCountry = await createCountry({
      name,
      isoCode,
    });

    return sendResponse({
      success: true,
      message: "Country created successfully",
      data: newCountry,
      status: 201,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
