import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { createBanner, getBanners } from "@/services/banner.service";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);

    const { banners, total } = await getBanners(options);

    return sendResponse({
      success: true,
      data: banners,
      message: "Banners fetched successfully",
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();

    const linkStr = formData.get("link") as string;
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;
    const file = formData.get("file") as File | null;

    if (!startDateStr || !endDateStr || !file) {
      return sendResponse({
        success: false,
        message: "Start date, end date, and image file are required",
        status: 400,
      });
    }

    const newBanner = await createBanner({
      link: linkStr,
      startDate: new Date(startDateStr),
      endDate: new Date(endDateStr),
      file: file,
    });

    return sendResponse({
      success: true,
      message: "Banner created successfully",
      data: newBanner,
      status: 201,
    });
  } catch (error) {
    return handleApiError(error);
  }
};
