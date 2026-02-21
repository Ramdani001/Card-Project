import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { deleteApiEndpoint, getApiEndpointById, updateApiEndpoint } from "@/services/master/apiEndpoint.service";
import { NextRequest } from "next/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const apiEndpoint = await getApiEndpointById(id);

    if (!apiEndpoint) return sendResponse({ success: false, message: "Api Endpoint not found", status: 404 });

    return sendResponse({
      success: true,
      message: "Api Endpoint fetched successfully",
      data: apiEndpoint,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const body = await req.json();

    const updatedApi = await updateApiEndpoint({
      id,
      ...body,
    });

    return sendResponse({
      success: true,
      message: "Api Endpoint updated successfully",
      data: updatedApi,
    });
  } catch (err: any) {
    if (err.message === "Api Endpoint not found") return sendResponse({ success: false, message: err.message, status: 404 });
    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    await deleteApiEndpoint(id);
    return sendResponse({ success: true, message: "Api Endpoint deleted successfully" });
  } catch (err: any) {
    if (err.message === "Api Endpoint not found") return sendResponse({ success: false, message: err.message, status: 404 });
    return handleApiError(err);
  }
};
