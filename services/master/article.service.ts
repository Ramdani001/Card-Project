import { deleteFile, saveFile } from "@/helpers/file.helper";
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
  if (existingSlug) throw new Error("Article title already exists (Slug conflict)");
  const uploadedFiles: any[] = [];

  try {
    if (files && files.length > 0) {
      for (const file of files) {
        const saved = await saveFile(file);
        uploadedFiles.push(saved);
      }
    }

    return await prisma.$transaction(async (tx) => {
      return await tx.article.create({
        data: {
          title,
          slug,
          content,
          images: {
            create: uploadedFiles.map((f) => ({
              ...f,
            })),
          },
        },
        include: { images: true },
      });
    });
  } catch (error) {
    for (const f of uploadedFiles) {
      if (f.path) await deleteFile(f.path).catch(console.error);
    }
    throw error;
  }
};

export const updateArticle = async (params: UpdateArticleParams) => {
  const { id, title, content, files } = params;

  const article = await prisma.article.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!article) throw new Error("Article not found");

  const newUploadedFiles: any[] = [];

  if (files && files.length > 0) {
    try {
      for (const file of files) {
        const saved = await saveFile(file);
        newUploadedFiles.push(saved);
      }
    } catch (uploadError) {
      for (const f of newUploadedFiles) {
        if (f.path) await deleteFile(f.path).catch(console.error);
      }
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
      if (newUploadedFiles.length > 0) {
        await tx.articleImage.deleteMany({ where: { articleId: id } });

        for (const fileData of newUploadedFiles) {
          await tx.articleImage.create({
            data: {
              articleId: id,
              ...fileData,
            },
          });
        }
      }

      const updated = await tx.article.update({
        where: { id },
        data: {
          ...(title && { title, slug }),
          ...(content && { content }),
        },
        include: { images: true },
      });

      return updated;
    });

    if (newUploadedFiles.length > 0 && article.images.length > 0) {
      for (const oldImg of article.images) {
        if (oldImg.path) await deleteFile(oldImg.path).catch(console.error);
      }
    }

    return updatedArticle;
  } catch (error) {
    for (const f of newUploadedFiles) {
      if (f.path) await deleteFile(f.path).catch(console.error);
    }
    throw error;
  }
};

export const deleteArticle = async (id: string) => {
  const article = await prisma.article.findUnique({ where: { id }, include: { images: true } });
  if (!article) throw new Error("Article not found");

  await prisma.article.delete({ where: { id } });

  for (const img of article.images) {
    await deleteFile(img.path);
  }

  return true;
};
