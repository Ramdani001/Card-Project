import { NextRequest } from "next/server";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { register } from "@/services/auth.service";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { email, password, name, phone } = body;

    if (!email || !password) {
      return sendResponse({
        success: false,
        message: "Email and password are required",
        status: 400,
      });
    }

    if (password.length < 6) {
      return sendResponse({
        success: false,
        message: "Password must be at least 6 characters",
        status: 400,
      });
    }

    const newUser = await register({
      email,
      password,
      name,
      phone,
    });

    return sendResponse({
      success: true,
      message: "Registration successful",
      data: newUser,
      status: 201,
    });
  } catch (err: any) {
    if (err.message === "Email already registered") {
      return sendResponse({ success: false, message: err.message, status: 409 });
    }
    return handleApiError(err);
  }
};
