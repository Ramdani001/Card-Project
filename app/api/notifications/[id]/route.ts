import { NextRequest } from "next/server";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { deleteNotification } from "@/services/transaction/notification.service";

export const DELETE = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;

    await deleteNotification(id);

    return sendResponse({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (err) {
    return handleApiError(err);
  }
};
