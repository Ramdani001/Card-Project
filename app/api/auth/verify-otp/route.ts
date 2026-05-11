import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { verifyRegistrationOtp } from "@/services/auth/auth.service";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return sendResponse({
        success: false,
        message: "Email and verification code are required",
        status: 400,
      });
    }

    const result = await verifyRegistrationOtp(email, code);    

    return sendResponse({
      success: true,
      message: "Registration verified successfully",
      data: result,
      status: 200,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};