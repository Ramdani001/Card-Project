import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";

interface CreateCategoryParams {
  name: string;
  note?: string;
}

interface UpdateCategoryParams {
  id: string;
  name?: string;
  note?: string;
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const getCategories = async (options: Prisma.CategoryFindManyArgs) => {
  const finalOptions: Prisma.CategoryFindManyArgs = {
    ...options,
    where: {
      ...options.where,
      isActive: true,
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
  const { name, note } = params;
  const slug = generateSlug(name);

  const existingSlug = await prisma.category.findUnique({
    where: { slug },
  });

  if (existingSlug) {
    throw new Error("Category with this name already exists");
  }

  return await prisma.category.create({
    data: {
      name,
      slug,
      note,
    },
  });
};

export const updateCategory = async (params: UpdateCategoryParams) => {
  const { id, name, note } = params;

  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new Error("Category not found");
  }

  let slug = undefined;
  if (name && name !== existingCategory.name) {
    slug = generateSlug(name);
    const slugExist = await prisma.category.findUnique({
      where: { slug },
    });
    if (slugExist && slugExist.id !== id) {
      throw new Error("Category name already taken");
    }
  }

  return await prisma.category.update({
    where: { id },
    data: {
      ...(name && { name, slug }),
      ...(note && { note }),
    },
  });
};

export const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return await prisma.category.update({
    where: { id },
    data: { isActive: false },
  });
};
