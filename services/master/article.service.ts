import { deleteFile, saveFile } from "@/helpers/file.helper";
import { logError } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { generateSlug } from "@/utils";

interface CreateArticleParams {
  title: string;
  content: string;
  files: File[];
}

interface UpdateArticleParams {
  id: string;
  title?: string;
  content?: string;
  files?: File[];
  removedImageIds: string[];
}

export const getArticles = async (options: Prisma.ArticleFindManyArgs) => {
  const finalOptions: Prisma.ArticleFindManyArgs = {
    where: {
      ...options.where,
    },
    include: {
      images: true,
    },
    orderBy: options.orderBy || { updatedAt: "desc" },
  };

  const [articles, total] = await Promise.all([prisma.article.findMany(finalOptions), prisma.article.count({ where: finalOptions.where })]);

  return { articles, total };
};

export const getArticleById = async (id: string) => {
  return await prisma.article.findUnique({
    where: { id },
    include: { images: true },
  });
};

export const createArticle = async (params: CreateArticleParams) => {
  const { title, content, files } = params;

  const slug = generateSlug(title);

  const existingSlug = await prisma.article.findUnique({ where: { slug } });
  if (existingSlug) throw new Error("Judul artikel sudah digunakan (Slug conflict)");

  const uploadedFiles: any[] = [];

  try {
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) => saveFile(file, "articles"));
      const results = await Promise.all(uploadPromises);
      uploadedFiles.push(...results);
    }

    return await prisma.article.create({
      data: {
        title,
        slug,
        content,
        images: {
          create: uploadedFiles.map((f) => ({
            url: f.url,
            path: f.path,
            originalName: f.originalName,
            fileName: f.fileName,
            mimeType: f.mimeType,
            size: f.size,
          })),
        },
      },
      include: { images: true },
    });
  } catch (error) {
    if (uploadedFiles.length > 0) {
      await Promise.all(uploadedFiles.map((f) => deleteFile(f.path).catch(console.error)));
    }

    logError("ArticleService.createArticle", error);
    throw error;
  }
};

export const updateArticle = async (params: UpdateArticleParams) => {
  const { id, title, content, files, removedImageIds } = params;

  const article = await prisma.article.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!article) throw new Error("Article not found");

  const newUploadedFiles: any[] = [];

  if (files && files.length > 0) {
    try {
      const uploadPromises = files.map((file) => saveFile(file, "articles"));
      const results = await Promise.all(uploadPromises);
      newUploadedFiles.push(...results);
    } catch (uploadError) {
      await Promise.all(newUploadedFiles.map((f) => deleteFile(f.path).catch(console.error)));

      logError("ArticleService.updateArticle", uploadError);
      throw uploadError;
    }
  }

  try {
    let slug = undefined;
    if (title && title !== article.title) {
      slug = generateSlug(title);
      const exist = await prisma.article.findUnique({ where: { slug } });
      if (exist && exist.id !== id) throw new Error("Article title already exists");
    }

    const updatedArticle = await prisma.$transaction(async (tx) => {
      if (removedImageIds && removedImageIds.length > 0) {
        await tx.articleImage.deleteMany({
          where: {
            id: { in: removedImageIds },
            articleId: id,
          },
        });
      }

      if (newUploadedFiles.length > 0) {
        await tx.articleImage.createMany({
          data: newUploadedFiles.map((f) => ({
            articleId: id,
            url: f.url,
            path: f.path,
            originalName: f.originalName,
            fileName: f.fileName,
            mimeType: f.mimeType,
            size: f.size,
          })),
        });
      }

      return await tx.article.update({
        where: { id },
        data: {
          ...(title && { title, slug }),
          ...(content && { content }),
        },
        include: { images: true },
      });
    });

    if (removedImageIds && removedImageIds.length > 0) {
      const filesToDelete = article.images.filter((img) => removedImageIds.includes(img.id));
      await Promise.all(filesToDelete.map((img) => deleteFile(img.path).catch(console.error)));
    }

    return updatedArticle;
  } catch (error) {
    if (newUploadedFiles.length > 0) {
      await Promise.all(newUploadedFiles.map((f) => deleteFile(f.path).catch(console.error)));
    }

    logError("ArticleService.updateArticle", error);
    throw error;
  }
};

export const deleteArticle = async (id: string) => {
  const article = await prisma.article.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!article) throw new Error("Article not found");

  try {
    await prisma.article.delete({
      where: { id },
    });

    if (article.images.length > 0) {
      await Promise.allSettled(article.images.map((img) => deleteFile(img.path)));
    }

    return true;
  } catch (error) {
    logError("ArticleService.deleteArticle", error);
    throw new Error("Failed to delete article and its resources");
  }
};
