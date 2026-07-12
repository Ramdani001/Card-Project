import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { deleteCourier, getCourierById, updateCourier } from "@/services/master/courier.service";
import { NextRequest } from "next/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    const courier = await getCourierById(id);

    if (!courier) {
      return sendResponse({ success: false, message: "Courier not found", status: 404 });
    }

    return sendResponse({
      success: true,
      message: "Courier fetched successfully",
      data: courier,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const body = await req.json();

    const { courierCode, status, description } = body;

    const updatedCourier = await updateCourier({
      id,
      courierCode: courierCode ?? undefined,
      description: description ?? undefined,
      status: status,
    });

    return sendResponse({
      success: true,
      message: "Courier updated successfully",
      data: updatedCourier,
    });
  } catch (err: any) {
    if (err.message === "Courier not found") {
      return sendResponse({ success: false, message: err.message, status: 404 });
    }
    if (err.message === "Courier name already taken") {
      return sendResponse({ success: false, message: err.message, status: 409 });
    }
    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    await deleteCourier(id);

    return sendResponse({
      success: true,
      message: "Courier deleted successfully",
    });
  } catch (err: any) {
    if (err.message === "Courier not found") {
      return sendResponse({ success: false, message: err.message, status: 404 });
    }
    return handleApiError(err);
  }
};
