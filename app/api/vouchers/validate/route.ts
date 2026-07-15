import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { authOptions } from "@/lib/auth";
import { validateVoucherForCheckout } from "@/services/master/voucher.service";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return sendResponse({
        success: false,
        message: "Unauthorized",
        status: 401,
      });
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const cartItemsParam = searchParams.get("cartItems");

    let cartItems;
    try {
      cartItems = cartItemsParam ? JSON.parse(cartItemsParam) : null;
    } catch {
      return NextResponse.json({ success: false, message: "Invalid cart items format." }, { status: 400 });
    }

    if (!code || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
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
