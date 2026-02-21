import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { deleteBanner, updateBanner } from "@/services/banner.service";
import { NextRequest } from "next/server";

type Params = {
  params: Promise<{ id: string }>;
};

export const PATCH = async (req: NextRequest, { params }: Params) => {
  try {
    const { id } = await params;
    const formData = await req.formData();

    const linkStr = formData.get("link") as string;
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;
    const file = formData.get("file") as File | null;

    const updatedBanner = await updateBanner({
      id,
      link: linkStr,
      startDate: startDateStr ? new Date(startDateStr) : undefined,
      endDate: endDateStr ? new Date(endDateStr) : undefined,
      file: file,
    });

    return sendResponse({
      success: true,
      message: "Banner updated successfully",
      data: updatedBanner,
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export const DELETE = async (req: NextRequest, { params }: Params) => {
  try {
    const { id } = await params;
    await deleteBanner(id);

    return sendResponse({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
};
