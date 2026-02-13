import { NextRequest } from "next/server";
import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { createCategory, getCategories } from "@/services/category.service";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);

    const { categories, total } = await getCategories(options);

    return sendResponse({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
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
    const body = await req.json();
    const { name, note } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return sendResponse({ success: false, message: "Category Name is required", status: 400 });
    }

    const newCategory = await createCategory({
      name,
      note,
    });

    return sendResponse({
      success: true,
      message: "Category created successfully",
      data: newCategory,
      status: 201,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
