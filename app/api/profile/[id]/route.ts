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
    const facebookUrl = formData.get("facebookUrl") as string | undefined;
    const instagramUrl = formData.get("instagramUrl") as string | undefined;
    const twitterUrl = formData.get("twitterUrl") as string | undefined;
    const password = formData.get("password") as string | undefined;
    const address = formData.get("address") as string | undefined;
    const countryIsoCode = (formData.get("countryIsoCode") as string) || undefined;
    const provinceCode = (formData.get("provinceCode") as string) || undefined;
    const cityCode = (formData.get("cityCode") as string) || undefined;
    const subDistrictCode = (formData.get("subDistrictCode") as string) || undefined;
    const villageCode = (formData.get("villageCode") as string) || undefined;
    const postalCode = formData.get("postalCode") as string | undefined;

    const updatedProfile = await updateProfile({
      userId: id,
      name,
      email,
      phone,
      facebookUrl,
      instagramUrl,
      twitterUrl,
      file,
      password,
      address,
      countryIsoCode,
      provinceCode,
      cityCode,
      subDistrictCode,
      villageCode,
      postalCode,
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
