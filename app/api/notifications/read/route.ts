import { NextRequest } from "next/server";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { markNotificationAsRead } from "@/services/transaction/notification.service";

export const PATCH = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return sendResponse({
        success: false,
        message: "Notification id is required",
        status: 400,
      });
    }

    const notification = await markNotificationAsRead(id);

    return sendResponse({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (err) {
    return handleApiError(err);
  }
};
