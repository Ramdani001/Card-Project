import { NextRequest } from "next/server";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { getAllConfigs, setConfig } from "@/services/system/config.service";

export const GET = async (_req: NextRequest) => {
  try {
    const configs = await getAllConfigs();
    return sendResponse({
      success: true,
      message: "All configs fetched",
      data: configs,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const { key, value } = await req.json();

    if (!key || !value) {
      return sendResponse({ success: false, message: "Key and Value are required", status: 400 });
    }

    const newConfig = await setConfig(key, String(value));

    return sendResponse({
      success: true,
      message: "Config created successfully",
      data: newConfig,
      status: 201,
    });
  } catch (err) {
    return handleApiError(err);
  }
};
