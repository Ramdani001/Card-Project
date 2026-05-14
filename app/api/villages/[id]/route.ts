import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { deleteVillage, getVillageById, updateVillage } from "@/services/master/village.service";
import { UpdateVillageParams } from "@/types/params/villageParams";
import { RouteParams } from "@/types/params/routeParams";
import { NextRequest } from "next/server";

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    const village = await getVillageById(id);

    if (!village) {
      return sendResponse({ success: false, message: "Village not found", status: 404 });
    }

    return sendResponse({
      success: true,
      message: "Village fetched successfully",
      data: village,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, code, subDistrictId } = body;

    const updatedVillage = await updateVillage(id, {
      name: name ?? undefined,
      code: code ?? undefined,
      subDistrictId: subDistrictId ?? undefined,
    } as UpdateVillageParams);

    return sendResponse({
      success: true,
      message: "Village updated successfully",
      data: updatedVillage,
    });
  } catch (err: any) {
    if (err.message === "Village not found") return sendResponse({ success: false, message: err.message, status: 404 });

    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    await deleteVillage(id);

    return sendResponse({
      success: true,
      message: "Village deleted successfully",
    });
  } catch (err: any) {
    if (err.message === "Village not found") return sendResponse({ success: false, message: err.message, status: 404 });
    return handleApiError(err);
  }
};
