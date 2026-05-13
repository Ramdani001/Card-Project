import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { deleteCountry, getCountryById, updateCountry } from "@/services/master/country.service";
import { RouteParams } from "@/types/params/routeParams";
import { NextRequest } from "next/server";

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    const country = await getCountryById(id);

    if (!country) {
      return sendResponse({ success: false, message: "Country not found", status: 404 });
    }

    return sendResponse({
      success: true,
      message: "Country fetched successfully",
      data: country,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, isoCode } = body;

    const updatedCountry = await updateCountry(id, {
      name: name ?? undefined,
      isoCode: isoCode ?? undefined,
    });

    return sendResponse({
      success: true,
      message: "Country updated successfully",
      data: updatedCountry,
    });
  } catch (err: any) {
    if (err.message === "Country not found") {
      return sendResponse({ success: false, message: err.message, status: 404 });
    }
    if (err.message === "Country name already taken") {
      return sendResponse({ success: false, message: err.message, status: 409 });
    }
    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    await deleteCountry(id);

    return sendResponse({
      success: true,
      message: "Country deleted successfully",
    });
  } catch (err: any) {
    if (err.message === "Country not found") {
      return sendResponse({ success: false, message: err.message, status: 404 });
    }
    return handleApiError(err);
  }
};
