import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { createArticle, getArticles } from "@/services/master/article.service";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);

    const { articles, total } = await getArticles(options);

    return sendResponse({
      success: true,
      message: "Articles fetched successfully",
      data: articles,
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

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    const files = formData.getAll("images") as File[];

    if (!title || !content) {
      return sendResponse({ success: false, message: "Title and Content are required", status: 400 });
    }

    if (files.length > 0) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
          return sendResponse({ success: false, message: `Invalid file type: ${file.name}`, status: 400 });
        }
        if (file.size > 5 * 1024 * 1024) {
          return sendResponse({ success: false, message: `File too large: ${file.name}`, status: 400 });
        }
      }
    }

    const newArticle = await createArticle({
      title,
      content,
      files,
    });

    return sendResponse({
      success: true,
      message: "Article created successfully",
      data: newArticle,
      status: 201,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
