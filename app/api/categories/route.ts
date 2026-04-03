import { NextRequest } from "next/server";
import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { createCategory, getCategories } from "@/services/master/category.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const GET = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const { options, page, limit } = getQueryPaginationOptions(req);
    const { categories, total } = await getCategories(options, userId);

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
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const note = formData.get("note") as string;
    const file = formData.get("file") as File | null;

    if (!name || name.trim() === "") {
      return sendResponse({
        success: false,
        message: "Category Name is required",
        status: 400,
      });
    }

    const newCategory = await createCategory({
      name,
      note,
      file,
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
