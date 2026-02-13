import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { register } from "@/services/auth.service";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;

    const file = formData.get("file") as File | null;

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
      name: name || undefined,
      phone: phone || undefined,
      file: file,
    });

    return sendResponse({
      success: true,
      message: "Registration successful",
      data: newUser,
      status: 201,
    });
  } catch (err: any) {
    if (err.message === "Email already registered") {
      return sendResponse({
        success: false,
        message: err.message,
        status: 409,
      });
    }
    return handleApiError(err);
  }
};
