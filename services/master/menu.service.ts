import { CONSTANT } from "@/constants";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { CreateMenuParams, UpdateMenuParams } from "@/types/params/menuParams";

export const getMenus = async (options: Prisma.MenuFindManyArgs) => {
  const defaultInclude: Prisma.MenuInclude = {
    parent: true,
    subMenus: {
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        subMenus: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          include: {
            subMenus: {
              where: { isActive: true },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    },
  };

  const whereClause: Prisma.MenuWhereInput = {
    ...options.where,
    isActive: true,
  };

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
    orderBy: options.orderBy || {
      order: "asc",
    },
  };

  const [menus, total] = await Promise.all([
    prisma.menu.findMany(finalOptions),
    prisma.menu.count({
      where: finalOptions.where,
    }),
  ]);

  return { menus, total };
};

export const getUserMenus = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user?.role) return [];

  const roleName = user.role.name;
  const roleId = user.role.id;

  const subMenuIncludeAdmin = {
    orderBy: { order: "asc" as const },
    where: { isDashboardMenu: true, isActive: true },
    include: {
      subMenus: {
        orderBy: { order: "asc" as const },
        where: { isDashboardMenu: true, isActive: true },
        include: {
          subMenus: {
            orderBy: { order: "asc" as const },
            where: { isDashboardMenu: true, isActive: true },
          },
        },
      },
    },
  };

  const subMenuIncludeUser = {
    orderBy: { order: "asc" as const },
    where: {
      roleMenuAccesses: {
        some: { roleId },
        isActive: true,
      },
      isActive: true,
    },
    include: {
      subMenus: {
        orderBy: { order: "asc" as const },
        where: {
          roleMenuAccesses: {
            some: { roleId },
            isActive: true,
          },
        },
        include: {
          subMenus: {
            orderBy: { order: "asc" as const },
            where: {
              isActive: true,
              roleMenuAccesses: {
                some: { roleId },
                isActive: true,
              },
            },
          },
        },
      },
    },
  };

  if (roleName === CONSTANT.ROLE_ADMIN_NAME) {
    return prisma.menu.findMany({
      where: {
        parentId: null,
        isDashboardMenu: true,
        isActive: true,
      },
      orderBy: { order: "asc" },
      include: {
        subMenus: subMenuIncludeAdmin,
      },
    });
  }

  return prisma.menu.findMany({
    where: {
      isActive: true,
      parentId: null,
      roleMenuAccesses: {
        some: { roleId },
        isActive: true,
      },
    },
    orderBy: { order: "asc" },
    include: {
      subMenus: subMenuIncludeUser,
    },
  });
};

export const getMenuById = async (id: string) => {
  return await prisma.menu.findUnique({
    where: { id },
    include: {
      subMenus: {
        orderBy: { order: "asc" },
        where: { isActive: true },
      },
      parent: true,
    },
  });
};

export const createMenu = async (params: CreateMenuParams) => {
  const { label, url, icon, order, parentId, isDashboardMenu } = params;

  if (parentId) {
    const parentExists = await prisma.menu.findUnique({ where: { id: parentId, isActive: true } });
    if (!parentExists) throw new Error("Parent menu not found");
  }

  return await prisma.menu.create({
    data: {
      label,
      url: url || null,
      icon: icon || null,
      order: order || 0,
      parentId: parentId || null,
      isDashboardMenu: isDashboardMenu,
    },
  });
};

export const updateMenu = async (params: UpdateMenuParams) => {
  const { id, label, url, icon, order, parentId, isDashboardMenu } = params;

  const existingMenu = await prisma.menu.findUnique({ where: { id } });
  if (!existingMenu) throw new Error("Menu not found");

  if (parentId) {
    if (parentId === id) throw new Error("Menu cannot be its own parent");
    const parentExists = await prisma.menu.findUnique({ where: { id: parentId, isActive: true } });
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
      ...(isDashboardMenu !== undefined && { isDashboardMenu }),
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
