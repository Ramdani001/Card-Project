import { NextRequest } from "next/server";
import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { createUser, getUsers } from "@/services/auth/user.service";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);

    const { users, total } = await getUsers(options);

    return sendResponse({
      success: true,
      message: "All users fetched successfully",
      data: users,
      metadata: {
        total,
        page: page || 1,
        limit: limit || 10,
        totalPages: Math.ceil(total / (limit || 10)),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const roleId = formData.get("roleId") as string;

    const file = formData.get("file") as File | null;

    if (!email || !password) {
      return sendResponse({
        success: false,
        message: "Email and password are required",
        status: 400,
      });
    }

    const newUser = await createUser({
      email,
      password,
      name: name || "",
      phone: phone || undefined,
      roleId: roleId || undefined,
      file: file,
    });

    return sendResponse({
      success: true,
      message: "User created successfully",
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
