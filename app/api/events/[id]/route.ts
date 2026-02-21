import { NextRequest } from "next/server";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { deleteEvent, getEventById, updateEvent } from "@/services/master/event.service";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const event = await getEventById(id);

    if (!event) return sendResponse({ success: false, message: "Event not found", status: 404 });

    return sendResponse({
      success: true,
      message: "Event fetched successfully",
      data: event,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const formData = await req.formData();

    const title = formData.get("title") as string | undefined;
    const content = formData.get("content") as string | undefined;
    const startDateStr = formData.get("startDate") as string | undefined;
    const endDateStr = formData.get("endDate") as string | undefined;
    const files = formData.getAll("images") as File[];

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateStr) startDate = new Date(startDateStr);
    if (endDateStr) endDate = new Date(endDateStr);

    const updatedEvent = await updateEvent({
      id,
      title,
      content,
      startDate,
      endDate,
      files: files.length > 0 ? files : undefined,
    });

    return sendResponse({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (err: any) {
    if (err.message === "Event not found") return sendResponse({ success: false, message: err.message, status: 404 });
    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    await deleteEvent(id);
    return sendResponse({ success: true, message: "Event deleted successfully" });
  } catch (err: any) {
    if (err.message === "Event not found") return sendResponse({ success: false, message: err.message, status: 404 });
    return handleApiError(err);
  }
};
