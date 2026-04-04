import { CONSTANT } from "@/constants";
import { deleteFile, saveFile } from "@/helpers/file.helper";
import { logError } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { generateSlug } from "@/utils";

interface CreateCategoryParams {
  name: string;
  note?: string;
  file?: File | null;
}

interface UpdateCategoryParams {
  id: string;
  name?: string;
  note?: string;
  file?: File | null;
}

export const getCategories = async (options: Prisma.CategoryFindManyArgs, userId?: string) => {
  let roleSecurityFilter: Prisma.CategoryWhereInput = {};

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: { cardCategoryRoleAccesses: true },
        },
      },
    });

    if (user && user.role) {
      if (user.role.name === CONSTANT.ROLE_ADMIN_NAME) {
        roleSecurityFilter = {};
      } else {
        const allowedCategoryIds = user.role.cardCategoryRoleAccesses.map((access) => access.categoryId);

        roleSecurityFilter = {
          id: { in: allowedCategoryIds },
        };
      }
    }
  } else {
    const guestRole = await prisma.role.findUnique({
      where: { name: CONSTANT.ROLE_GUEST_NAME },
      include: { cardCategoryRoleAccesses: true },
    });

    if (guestRole) {
      const allowedCategoryIds = guestRole.cardCategoryRoleAccesses.map((access) => access.categoryId);

      roleSecurityFilter = {
        id: { in: allowedCategoryIds },
      };
    }
  }

  const finalOptions: Prisma.CategoryFindManyArgs = {
    ...options,
    where: {
      ...options.where,
      ...roleSecurityFilter,
    },
    include: {
      _count: {
        select: { cards: true },
      },
    },
  };

  const [categories, total] = await Promise.all([prisma.category.findMany(finalOptions), prisma.category.count({ where: finalOptions.where })]);

  return { categories, total };
};

export const getCategoryById = async (id: string) => {
  return await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { cards: true },
      },
    },
  });
};

export const createCategory = async (params: CreateCategoryParams) => {
  const { name, note, file } = params;
  const slug = generateSlug(name);

  const existingSlug = await prisma.category.findUnique({
    where: { slug },
  });

  if (existingSlug) {
    throw new Error("Category with this name already exists");
  }

  let fileData: { url: string; path: string } | null = null;
  if (file && file.size > 0) {
    fileData = await saveFile(file, "categories");
  }

  try {
    return await prisma.category.create({
      data: {
        name,
        slug,
        note,
        urlImage: fileData?.url ?? null,
        pathImage: fileData?.path ?? null,
      },
    });
  } catch (error) {
    if (fileData) await deleteFile(fileData.path).catch(console.error);

    logError("CategoryService.createCategory", error);
    throw error;
  }
};

export const updateCategory = async (params: UpdateCategoryParams) => {
  const { id, name, note, file } = params;

  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new Error("Category not found");
  }

  let slug = undefined;
  if (name && name !== existingCategory.name) {
    slug = generateSlug(name);
    const slugExist = await prisma.category.findUnique({ where: { slug } });
    if (slugExist && slugExist.id !== id) {
      throw new Error("Category name already taken");
    }
  }

  let fileData: { url: string; path: string } | null = null;
  if (file && file.size > 0) {
    fileData = await saveFile(file, "categories");
  }

  try {
    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name, slug }),
        note,
        ...(fileData && { urlImage: fileData.url, pathImage: fileData.path }),
      },
    });

    if (fileData && existingCategory.pathImage) {
      await deleteFile(existingCategory.pathImage).catch(console.error);
    }

    return updated;
  } catch (error) {
    if (fileData) await deleteFile(fileData.path).catch(console.error);

    logError("CategoryService.updateCategory", error);
    throw error;
  }
};

export const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  const deletedCategory = await prisma.category.delete({
    where: { id },
  });

  if (deletedCategory.pathImage) {
    await deleteFile(deletedCategory.pathImage).catch(console.error);
  }

  return deletedCategory;
};
