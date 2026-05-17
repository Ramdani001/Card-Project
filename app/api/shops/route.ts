import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { createShop, getShops } from "@/services/master/shop.service";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);
    const { shops, total } = await getShops(options);

    return sendResponse({
      success: true,
      message: "Shops fetched successfully",
      data: shops,
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

    const { name, address, countryIsoCode, provinceCode, cityCode, subDistrictCode, villageCode, postalCode, isMainShop } = body;

    const newShop = await createShop({
      name,
      address,
      countryIsoCode,
      provinceCode,
      cityCode,
      subDistrictCode,
      villageCode,
      postalCode,
      isMainShop,
    });

    return sendResponse({
      success: true,
      message: "Shop created successfully",
      data: newShop,
      status: 201,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
