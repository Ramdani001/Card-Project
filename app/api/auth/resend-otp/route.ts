import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { resendOtp } from "@/services/auth/auth.service";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return sendResponse({
        success: false,
        message: "Email is required",
        status: 400,
      });
    }

    const result = await resendOtp(email);

    return sendResponse({
      success: true,
      message: "A new verification code has been sent to your email",
      data: result,
      status: 200,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
