import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";

export const getRoleCategoryAccesses = async (options: Prisma.CardCategoryRoleAccessFindManyArgs) => {
  const finalOptions: Prisma.CardCategoryRoleAccessFindManyArgs = {
    ...options,
    where: {
      ...options.where,
      isActive: true,
    },
    include: {
      role: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
    },
    orderBy: options.orderBy || { createdAt: "desc" },
  };

  const [accesses, total] = await Promise.all([
    prisma.cardCategoryRoleAccess.findMany(finalOptions),
    prisma.cardCategoryRoleAccess.count({ where: finalOptions.where }),
  ]);

  return { accesses, total };
};

export const getRoleCategoryAccessById = async (id: string) => {
  return await prisma.cardCategoryRoleAccess.findUnique({
    where: { id },
    include: {
      role: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
    },
  });
};

export const createRoleCategoryAccess = async (roleId: string, categoryId: string) => {
  const existingAccess = await prisma.cardCategoryRoleAccess.findFirst({
    where: { roleId, categoryId },
  });

  if (existingAccess) {
    if (existingAccess.isActive) {
      throw new Error("This role already has active access to this category");
    }
    return await prisma.cardCategoryRoleAccess.update({
      where: { id: existingAccess.id },
      data: { isActive: true },
    });
  }

  return await prisma.cardCategoryRoleAccess.create({
    data: { roleId, categoryId, isActive: true },
  });
};

export const updateRoleCategoryAccess = async (id: string, data: { roleId?: string; categoryId?: string; isActive?: boolean }) => {
  const existingAccess = await prisma.cardCategoryRoleAccess.findUnique({ where: { id } });
  if (!existingAccess) throw new Error("Access record not found");

  if ((data.roleId && data.roleId !== existingAccess.roleId) || (data.categoryId && data.categoryId !== existingAccess.categoryId)) {
    const checkDuplicate = await prisma.cardCategoryRoleAccess.findFirst({
      where: {
        roleId: data.roleId || existingAccess.roleId,
        categoryId: data.categoryId || existingAccess.categoryId,
        id: { not: id },
      },
    });

    if (checkDuplicate && checkDuplicate.isActive) {
      throw new Error("This role already has access to this category");
    }
  }

  return await prisma.cardCategoryRoleAccess.update({
    where: { id },
    data,
  });
};

export const deleteRoleCategoryAccess = async (id: string) => {
  const existingAccess = await prisma.cardCategoryRoleAccess.findUnique({ where: { id } });
  if (!existingAccess) throw new Error("Access record not found");

  return await prisma.cardCategoryRoleAccess.update({
    where: { id },
    data: { isActive: false },
  });
};
