import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { deleteProvince, getProvinceById, updateProvince } from "@/services/master/province.service";
import { UpdateProvinceParams } from "@/types/params/provinceParams";
import { RouteParams } from "@/types/params/routeParams";
import { NextRequest } from "next/server";

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    const province = await getProvinceById(id);

    if (!province) {
      return sendResponse({ success: false, message: "Province not found", status: 404 });
    }

    return sendResponse({
      success: true,
      message: "Province fetched successfully",
      data: province,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, code, countryId } = body;

    const updatedProvince = await updateProvince(id, {
      name: name ?? undefined,
      code: code ?? undefined,
      countryId: countryId ?? undefined,
    } as UpdateProvinceParams);

    return sendResponse({
      success: true,
      message: "Province updated successfully",
      data: updatedProvince,
    });
  } catch (err: any) {
    if (err.message === "Province not found") {
      return sendResponse({ success: false, message: err.message, status: 404 });
    }
    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    await deleteProvince(id);

    return sendResponse({
      success: true,
      message: "Province deleted successfully",
    });
  } catch (err: any) {
    if (err.message === "Province not found") {
      return sendResponse({ success: false, message: err.message, status: 404 });
    }
    return handleApiError(err);
  }
};
