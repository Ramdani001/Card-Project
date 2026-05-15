import { NextRequest } from "next/server";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { deleteUser, getUserById, updateUser } from "@/services/auth/user.service";
import { RouteParams } from "@/types/params/routeParams";

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    const user = await getUserById(id);

    if (!user) {
      return sendResponse({
        success: false,
        message: "User not found",
        status: 404,
      });
    }

    return sendResponse({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    const formData = await req.formData();

    const updatedUser = await updateUser({
      id,
      name: (formData.get("name") as string) || undefined,
      email: (formData.get("email") as string) || undefined,
      phone: (formData.get("phone") as string) || undefined,
      password: (formData.get("password") as string) || undefined,
      roleId: (formData.get("roleId") as string) || undefined,
      facebookUrl: (formData.get("facebookUrl") as string) || undefined,
      instagramUrl: (formData.get("instagramUrl") as string) || undefined,
      twitterUrl: (formData.get("twitterUrl") as string) || undefined,
      address: (formData.get("address") as string) || undefined,
      countryIsoCode: (formData.get("countryIsoCode") as string) || undefined,
      provinceCode: (formData.get("provinceCode") as string) || undefined,
      cityCode: (formData.get("cityCode") as string) || undefined,
      subDistrictCode: (formData.get("subDistrictCode") as string) || undefined,
      villageCode: (formData.get("villageCode") as string) || undefined,
      postalCode: (formData.get("postalCode") as string) || undefined,
      file: formData.get("file") as File | null,
    });

    return sendResponse({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err: any) {
    if (err.message === "User not found") {
      return sendResponse({ success: false, message: err.message, status: 404 });
    }
    if (err.code === "P2002") {
      return sendResponse({ success: false, message: "Email already exists", status: 409 });
    }
    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    await deleteUser(id);

    return sendResponse({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err: any) {
    if (err.message === "User not found") {
      return sendResponse({ success: false, message: err.message, status: 404 });
    }
    return handleApiError(err);
  }
};
