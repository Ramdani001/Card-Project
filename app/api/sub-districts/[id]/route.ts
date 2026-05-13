import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { deleteSubDistrict, getSubDistrictById, updateSubDistrict } from "@/services/master/subDistrict.service";
import { UpdateSubDistrictParams } from "@/types/params/subDistrictParams";
import { RouteParams } from "@/types/params/routeParams";
import { NextRequest } from "next/server";

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    const subDistrict = await getSubDistrictById(id);

    if (!subDistrict) {
      return sendResponse({ success: false, message: "Sub District not found", status: 404 });
    }

    return sendResponse({
      success: true,
      message: "Sub District fetched successfully",
      data: subDistrict,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, code, cityId } = body;

    const updatedSubDistrict = await updateSubDistrict(id, {
      name: name ?? undefined,
      code: code ?? undefined,
      cityId: cityId ?? undefined,
    } as UpdateSubDistrictParams);

    return sendResponse({
      success: true,
      message: "Sub District updated successfully",
      data: updatedSubDistrict,
    });
  } catch (err: any) {
    if (err.message === "SubDistrict not found") return sendResponse({ success: false, message: err.message, status: 404 });

    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    await deleteSubDistrict(id);

    return sendResponse({
      success: true,
      message: "Sub District deleted successfully",
    });
  } catch (err: any) {
    if (err.message === "SubDistrict not found") return sendResponse({ success: false, message: err.message, status: 404 });
    return handleApiError(err);
  }
};
