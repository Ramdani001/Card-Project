import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { deleteNotification } from "@/services/transaction/notification.service";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const DELETE = async ({ params }: RouteParams) => {
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
