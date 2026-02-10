import { NextRequest } from "next/server";
import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { createEvent, getEvents } from "@/services/event.service";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);

    const { events, total } = await getEvents(options);

    return sendResponse({
      success: true,
      message: "Events fetched successfully",
      data: events,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;

    const files = formData.getAll("images") as File[];

    if (!title || !content || !startDateStr || !endDateStr) {
      return sendResponse({ success: false, message: "Title, Content, Start Date, and End Date are required", status: 400 });
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return sendResponse({ success: false, message: "Invalid date format", status: 400 });
    }

    if (files.length > 0) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
          return sendResponse({ success: false, message: `Invalid file type: ${file.name}`, status: 400 });
        }
        if (file.size > 5 * 1024 * 1024) {
          return sendResponse({ success: false, message: `File too large: ${file.name}`, status: 400 });
        }
      }
    }

    const newEvent = await createEvent({
      title,
      content,
      startDate,
      endDate,
      files,
    });

    return sendResponse({
      success: true,
      message: "Event created successfully",
      data: newEvent,
      status: 201,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
