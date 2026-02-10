import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";

interface CreateMenuParams {
  label: string;
  url?: string;
  icon?: string;
  order?: number;
  parentId?: string | null;
}

interface UpdateMenuParams {
  id: string;
  label?: string;
  url?: string;
  icon?: string;
  order?: number;
  parentId?: string | null;
  isActive?: boolean;
}

export const getMenus = async (options: Prisma.MenuFindManyArgs) => {
  const finalOptions: Prisma.MenuFindManyArgs = {
    where: {
      ...options.where,
      isActive: true,
    },
    include: {
      subMenus: {
        orderBy: { order: "asc" },
      },
      ...options.include,
    },
    orderBy: options.orderBy || { order: "asc" },
  };

  const [menus, total] = await Promise.all([prisma.menu.findMany(finalOptions), prisma.menu.count({ where: finalOptions.where })]);

  return { menus, total };
};

export const getMenuById = async (id: string) => {
  return await prisma.menu.findUnique({
    where: { id },
    include: {
      subMenus: {
        orderBy: { order: "asc" },
      },
      parent: true,
    },
  });
};

export const createMenu = async (params: CreateMenuParams) => {
  const { label, url, icon, order, parentId } = params;

  if (parentId) {
    const parentExists = await prisma.menu.findUnique({ where: { id: parentId } });
    if (!parentExists) throw new Error("Parent menu not found");
  }

  return await prisma.menu.create({
    data: {
      label,
      url: url || null,
      icon: icon || null,
      order: order || 0,
      parentId: parentId || null,
    },
  });
};

export const updateMenu = async (params: UpdateMenuParams) => {
  const { id, label, url, icon, order, parentId, isActive } = params;

  const existingMenu = await prisma.menu.findUnique({ where: { id } });
  if (!existingMenu) throw new Error("Menu not found");

  if (parentId) {
    if (parentId === id) throw new Error("Menu cannot be its own parent");
    const parentExists = await prisma.menu.findUnique({ where: { id: parentId } });
    if (!parentExists) throw new Error("Parent menu not found");
  }

  return await prisma.menu.update({
    where: { id },
    data: {
      ...(label && { label }),
      ...(url !== undefined && { url }),
      ...(icon !== undefined && { icon }),
      ...(order !== undefined && { order }),
      ...(parentId !== undefined && { parentId }),
      ...(isActive !== undefined && { isActive }),
    },
  });
};

export const deleteMenu = async (id: string) => {
  const existingMenu = await prisma.menu.findUnique({ where: { id } });
  if (!existingMenu) throw new Error("Menu not found");

  return await prisma.menu.update({
    where: { id },
    data: { isActive: false },
  });
};
