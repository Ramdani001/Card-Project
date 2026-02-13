import { NextRequest } from "next/server";
import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { createCard, getCards } from "@/services/card.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);

    const { cards, total } = await getCards(options);

    return sendResponse({
      success: true,
      message: "Cards fetched successfully",
      data: cards,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return sendResponse({ success: false, message: "Unauthorized", status: 401 });
    }

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const priceRaw = formData.get("price");
    const stockRaw = formData.get("stock");
    const description = (formData.get("description") as string) || "";
    const sku = (formData.get("sku") as string) || undefined;
    const discountId = formData.get("discountId") as string | null;
    const file = formData.get("image") as File | null;
    const categoryIds = formData.getAll("categoryIds") as string[];

    if (!name?.trim()) {
      return sendResponse({ success: false, message: "Card Name is required", status: 400 });
    }

    if (!priceRaw || isNaN(Number(priceRaw)) || Number(priceRaw) < 0) {
      return sendResponse({ success: false, message: "Valid Price is required", status: 400 });
    }

    if (!stockRaw || isNaN(Number(stockRaw)) || Number(stockRaw) < 0) {
      return sendResponse({ success: false, message: "Valid Stock is required", status: 400 });
    }

    if (!categoryIds || categoryIds.length === 0) {
      return sendResponse({ success: false, message: "At least one Category is required", status: 400 });
    }

    if (!file || file.size === 0) {
      return sendResponse({ success: false, message: "Image is required", status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return sendResponse({ success: false, message: "File must be an image (JPG, PNG, WEBP)", status: 400 });
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return sendResponse({ success: false, message: "Image size must be less than 5MB", status: 400 });
    }

    const cleanDiscountId = discountId === "null" || discountId === "" ? null : discountId;

    const newCard = await createCard({
      name,
      price: Number(priceRaw),
      stock: Number(stockRaw),
      categoryIds,
      discountId: cleanDiscountId,
      description,
      sku,
      file,
      userId: session.user.id,
    });

    return sendResponse({
      success: true,
      message: "Card created successfully",
      data: newCard,
      status: 201,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
