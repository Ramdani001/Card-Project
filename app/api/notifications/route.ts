import { NextRequest } from "next/server";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { createNotification, getUserNotifications } from "@/services/transaction/notification.service";
import { NotificationType } from "@/prisma/generated/prisma/enums";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export const GET = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendResponse({ success: false, message: "Unauthorized", status: 401 });
    }

    const userId = session.user.id;

    if (!userId) {
      return sendResponse({
        success: false,
        message: "userId is required",
        status: 400,
      });
    }

    const notifications = await getUserNotifications(userId);

    return sendResponse({
      success: true,
      message: "Notifications fetched successfully",
      data: notifications,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const { toUserId, title, message, type, url, metadata } = body;

    if (!toUserId || !title || !message || !type) {
      return sendResponse({
        success: false,
        message: "toUserId, title, message and type are required",
        status: 400,
      });
    }

    const notification = await createNotification({
      toUserId,
      title,
      message,
      type: type as NotificationType,
      url,
      metadata,
    });

    return sendResponse({
      success: true,
      message: "Notification created successfully",
      data: notification,
      status: 201,
    });
  } catch (err) {
    return handleApiError(err);
  }
};
