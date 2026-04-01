import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { authOptions } from "@/lib/auth";
import { markAllNotificationsAsRead } from "@/services/transaction/notification.service";
import { getServerSession } from "next-auth";

export const PATCH = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendResponse({ success: false, message: "Unauthorized", status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return sendResponse({ success: false, message: "Unauthorized", status: 401 });
    }

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
