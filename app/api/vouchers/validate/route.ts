import { NextResponse } from "next/server";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { validateVoucherForCheckout } from "@/services/master/voucher.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return sendResponse({
        success: false,
        message: "Unauthorized",
        status: 401,
      });
    }

    const body = await req.json();
    const { code, cartItems } = body;

    if (!code || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ success: false, message: "Voucher code and cart items must be submitted." }, { status: 400 });
    }

    const result = await validateVoucherForCheckout(code, cartItems, session.user.id);

    if (!result.success) {
      return sendResponse({ success: false, message: result.message });
    }

    return sendResponse({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
