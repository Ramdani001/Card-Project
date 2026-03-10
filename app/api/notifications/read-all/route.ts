import { NextRequest } from "next/server";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { markAllNotificationsAsRead } from "@/services/transaction/notification.service";

export const PATCH = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return sendResponse({
        success: false,
        message: "userId is required",
        status: 400,
      });
    }

    await markAllNotificationsAsRead(userId);

    return sendResponse({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (err) {
    return handleApiError(err);
  }
};
