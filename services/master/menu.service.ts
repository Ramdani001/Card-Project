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
}

export const getMenus = async (options: Prisma.MenuFindManyArgs) => {
  const defaultInclude: Prisma.MenuInclude = {
    parent: true,
    subMenus: {
      orderBy: { order: "asc" },
    },
  };

  const whereClause: Prisma.MenuWhereInput = { ...options.where };

  if (whereClause.parent) {
    const parentFilter = whereClause.parent as any;

    const keyword = parentFilter.contains || parentFilter.label?.contains || parentFilter;

    if (typeof keyword === "string") {
      if (keyword.toLowerCase() === "root") {
        whereClause.parentId = null;

        delete whereClause.parent;
      } else {
        whereClause.parent = {
          is: {
            label: {
              contains: keyword,
              mode: "insensitive",
            },
          },
        };
      }
    }
  }

  const finalOptions: Prisma.MenuFindManyArgs = {
    ...options,
    where: whereClause,
    include: {
      ...defaultInclude,
      ...((options.include as Prisma.MenuInclude) || {}),
    },
    orderBy: options.orderBy || { order: "asc" },
  };

  const [menus, total] = await Promise.all([prisma.menu.findMany(finalOptions), prisma.menu.count({ where: finalOptions.where })]);

  return { menus, total };
};

export const getUserMenus = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: { select: { id: true, name: true } } },
  });

  if (!user || !user.role) return [];

  const roleName = user.role.name;
  const roleId = user.role.id;

  const isAdmin = ["ADMIN", "SUPER_ADMIN", "ADMINISTRATOR"].includes(roleName.toUpperCase());

  if (isAdmin) {
    return await prisma.menu.findMany({
      where: {
        parentId: null,
      },
      orderBy: { order: "asc" },
      include: {
        subMenus: {
          orderBy: { order: "asc" },
        },
      },
    });
  } else {
    return await prisma.menu.findMany({
      where: {
        parentId: null,
        roleMenuAccesses: {
          some: { roleId: roleId },
        },
      },
      orderBy: { order: "asc" },
      include: {
        subMenus: {
          where: {
            roleMenuAccesses: {
              some: { roleId: roleId },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });
  }
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
  const { id, label, url, icon, order, parentId } = params;

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
    },
  });
};

export const deleteMenu = async (id: string) => {
  const existingMenu = await prisma.menu.findUnique({ where: { id } });
  if (!existingMenu) throw new Error("Menu not found");

  return await prisma.menu.delete({
    where: { id },
  });
};
