import { NextRequest } from "next/server";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { deleteCategory, getCategoryById, updateCategory } from "@/services/master/category.service";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    const category = await getCategoryById(id);

    if (!category) {
      return sendResponse({ success: false, message: "Category not found", status: 404 });
    }

    return sendResponse({
      success: true,
      message: "Category fetched successfully",
      data: category,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, note } = body;

    if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
      return sendResponse({ success: false, message: "Valid Category Name is required", status: 400 });
    }

    const updatedCategory = await updateCategory({
      id,
      name,
      note,
    });

    return sendResponse({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (err: any) {
    if (err.message === "Category not found") {
      return sendResponse({ success: false, message: err.message, status: 404 });
    }
    if (err.message === "Category name already taken") {
      return sendResponse({ success: false, message: err.message, status: 409 });
    }
    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    await deleteCategory(id);

    return sendResponse({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (err: any) {
    if (err.message === "Category not found") {
      return sendResponse({ success: false, message: err.message, status: 404 });
    }
    return handleApiError(err);
  }
};
