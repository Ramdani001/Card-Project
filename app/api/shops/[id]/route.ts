import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { deleteShop, getShopById, updateShop } from "@/services/master/shop.service";
import { NextRequest } from "next/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    const category = await getShopById(id);

    if (!category) {
      return sendResponse({ success: false, message: "Shop not found", status: 404 });
    }

    return sendResponse({
      success: true,
      message: "Shop fetched successfully",
      data: category,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const body = await req.json();

    const { name, address, countryIsoCode, provinceCode, cityCode, subDistrictCode, villageCode, postalCode, isMainShop } = body;

    const updatedShop = await updateShop({
      id,
      name: name ?? undefined,
      address: address ?? undefined,
      countryIsoCode: countryIsoCode ?? undefined,
      provinceCode: provinceCode ?? undefined,
      cityCode: cityCode ?? undefined,
      subDistrictCode: subDistrictCode ?? undefined,
      villageCode: villageCode ?? undefined,
      postalCode: postalCode ?? undefined,
      isMainShop: isMainShop !== undefined ? isMainShop : undefined,
    });

    return sendResponse({
      success: true,
      message: "Shop updated successfully",
      data: updatedShop,
    });
  } catch (err: any) {
    if (err.message === "Shop not found") {
      return sendResponse({ success: false, message: err.message, status: 404 });
    }
    if (err.message === "Shop name already taken") {
      return sendResponse({ success: false, message: err.message, status: 409 });
    }
    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    await deleteShop(id);

    return sendResponse({
      success: true,
      message: "Shop deleted successfully",
    });
  } catch (err: any) {
    if (err.message === "Shop not found") {
      return sendResponse({ success: false, message: err.message, status: 404 });
    }
    return handleApiError(err);
  }
};
