import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { deleteArticle, getArticleById, updateArticle } from "@/services/master/article.service";
import { NextRequest } from "next/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const article = await getArticleById(id);

    if (!article) return sendResponse({ success: false, message: "Article not found", status: 404 });

    return sendResponse({
      success: true,
      message: "Article fetched successfully",
      data: article,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const formData = await req.formData();

    const title = formData.get("title") as string | undefined;
    const content = formData.get("content") as string | undefined;
    const files = formData.getAll("images") as File[];

    const updatedArticle = await updateArticle({
      id,
      title,
      content,
      files: files.length > 0 ? files : undefined,
    });

    return sendResponse({
      success: true,
      message: "Article updated successfully",
      data: updatedArticle,
    });
  } catch (err: any) {
    if (err.message === "Article not found") return sendResponse({ success: false, message: err.message, status: 404 });
    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    await deleteArticle(id);
    return sendResponse({ success: true, message: "Article deleted successfully" });
  } catch (err: any) {
    if (err.message === "Article not found") return sendResponse({ success: false, message: err.message, status: 404 });
    return handleApiError(err);
  }
};
