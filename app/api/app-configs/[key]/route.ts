import { NextRequest } from "next/server";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { getConfigByKey, setConfig, deleteConfig } from "@/services/config.service";

type RouteParams = {
  params: Promise<{ key: string }>;
};

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { key } = await params;

    const config = await getConfigByKey(key);

    if (!config) {
      return sendResponse({
        success: false,
        message: `Config with key '${key}' not found`,
        status: 404,
      });
    }

    return sendResponse({
      success: true,
      message: "Config fetched successfully",
      data: config,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const PUT = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { key } = await params;
    const body = await req.json();

    if (!body.value) {
      return sendResponse({ success: false, message: "Value is required", status: 400 });
    }

    const valueString = typeof body.value === "string" ? body.value : JSON.stringify(body.value);

    const updatedConfig = await setConfig(key, valueString);

    return sendResponse({
      success: true,
      message: "Config saved successfully",
      data: updatedConfig,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { key } = await params;
    await deleteConfig(key);
    return sendResponse({ success: true, message: "Config deleted successfully" });
  } catch (err: any) {
    if (err.message === "Config not found") return sendResponse({ success: false, message: err.message, status: 404 });
    return handleApiError(err);
  }
};
