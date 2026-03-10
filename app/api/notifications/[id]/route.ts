import { NextRequest } from "next/server"; // Import NextRequest
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { deleteNotification } from "@/services/transaction/notification.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const DELETE = async (request: NextRequest, { params }: RouteContext) => {
  try {
    const { id } = await params;

    await deleteNotification(id);

    return sendResponse({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (err) {
    return handleApiError(err);
  }
};
