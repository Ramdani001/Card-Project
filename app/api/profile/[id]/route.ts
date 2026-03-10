import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { getProfile, updateProfile } from "@/services/auth/auth.service";
import { NextRequest } from "next/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const profile = await getProfile(id);

    return sendResponse({
      success: true,
      message: "Profile fetched successfully",
      data: profile,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    const formData = await req.formData();

    const name = formData.get("name") as string | undefined;
    const email = formData.get("email") as string | undefined;
    const phone = formData.get("phone") as string | undefined;
    const file = formData.get("file") as File | null;

    const updatedProfile = await updateProfile({
      userId: id,
      name,
      email,
      phone,
      file,
    });

    return sendResponse({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (err) {
    return handleApiError(err);
  }
};
