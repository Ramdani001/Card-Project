import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { authOptions } from "@/lib/auth";
import { getUserMenus } from "@/services/menu.service";
import { getServerSession } from "next-auth";

export const GET = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendResponse({ success: false, message: "Unauthorized", status: 401 });
    }

    const menus = await getUserMenus(session.user.id);

    return sendResponse({
      success: true,
      message: "User menus fetched successfully",
      data: menus,
    });
  } catch (error) {
    return handleApiError(error);
  }
};
