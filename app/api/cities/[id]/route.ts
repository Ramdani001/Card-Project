import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { deleteCity, getCityById, updateCity } from "@/services/master/city.service";
import { UpdateCityParams } from "@/types/params/cityParams";
import { RouteParams } from "@/types/params/routeParams";
import { NextRequest } from "next/server";

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    const city = await getCityById(id);

    if (!city) {
      return sendResponse({ success: false, message: "City not found", status: 404 });
    }

    return sendResponse({
      success: true,
      message: "City fetched successfully",
      data: city,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, code, provinceId } = body;

    const updatedCity = await updateCity(id, {
      name: name ?? undefined,
      code: code ?? undefined,
      provinceId: provinceId ?? undefined,
    } as UpdateCityParams);

    return sendResponse({
      success: true,
      message: "City updated successfully",
      data: updatedCity,
    });
  } catch (err: any) {
    if (err.message === "City not found") return sendResponse({ success: false, message: err.message, status: 404 });

    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    await deleteCity(id);

    return sendResponse({
      success: true,
      message: "City deleted successfully",
    });
  } catch (err: any) {
    if (err.message === "City not found") return sendResponse({ success: false, message: err.message, status: 404 });
    return handleApiError(err);
  }
};
