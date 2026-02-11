import { NextRequest } from "next/server";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { getCardById, updateCard, deleteCard } from "@/services/card.service";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const card = await getCardById(id);

    if (!card) {
      return sendResponse({ success: false, message: "Card not found", status: 404 });
    }

    return sendResponse({
      success: true,
      message: "Card fetched successfully",
      data: card,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const formData = await req.formData();

    const getNumber = (key: string): number | undefined => {
      const val = formData.get(key);
      if (val === null || val.toString().trim() === "") return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    };

    const name = formData.get("name") as string | undefined;
    const price = getNumber("price");
    const stock = getNumber("stock");
    const description = formData.get("description") as string | undefined;
    const sku = formData.get("sku") as string | undefined;
    const file = formData.get("image") as File | null;

    let categoryIds: string[] | undefined;
    if (formData.has("categoryIds")) {
      categoryIds = formData.getAll("categoryIds") as string[];
    }

    let discountId: string | null | undefined;
    if (formData.has("discountId")) {
      const rawDisc = formData.get("discountId") as string;
      discountId = rawDisc === "null" || rawDisc === "" ? null : rawDisc;
    }

    if (price !== undefined && price < 0) {
      return sendResponse({ success: false, message: "Price cannot be negative", status: 400 });
    }
    if (stock !== undefined && stock < 0) {
      return sendResponse({ success: false, message: "Stock cannot be negative", status: 400 });
    }

    if (file && file.size > 0) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        return sendResponse({ success: false, message: "Invalid image type", status: 400 });
      }
      if (file.size > 5 * 1024 * 1024) {
        return sendResponse({ success: false, message: "Image too large (max 5MB)", status: 400 });
      }
    }

    const updatedCard = await updateCard({
      id,
      name,
      price,
      stock,
      categoryIds,
      discountId,
      description,
      sku,
      file,
    });

    return sendResponse({
      success: true,
      message: "Card updated successfully",
      data: updatedCard,
    });
  } catch (err: any) {
    if (err.message === "Card not found") {
      return sendResponse({ success: false, message: err.message, status: 404 });
    }
    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    await deleteCard(id);

    return sendResponse({
      success: true,
      message: "Card deleted successfully",
    });
  } catch (err: any) {
    if (err.message === "Card not found") {
      return sendResponse({ success: false, message: err.message, status: 404 });
    }
    return handleApiError(err);
  }
};
