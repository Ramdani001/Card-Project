import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";

export interface ApiAccessInput {
  url: string;
  description?: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

interface CreateRoleParams {
  name: string;
  categoryIds?: string[];
  menuIds?: string[];
  apiAccesses?: ApiAccessInput[];
}

interface UpdateRoleParams {
  id: string;
  name?: string;
  categoryIds?: string[];
  menuIds?: string[];
  apiAccesses?: ApiAccessInput[];
}

export const getRoles = async (options: Prisma.RoleFindManyArgs) => {
  const finalOptions: Prisma.RoleFindManyArgs = {
    ...options,
    include: {
      _count: { select: { users: true } },
      cardCategoryRoleAccesses: { select: { categoryId: true, category: true } },
      roleMenuAccesses: { include: { menu: true } },
      roleApiAccesses: {
        include: { apiEndpoints: true },
      },
    },
    orderBy: options.orderBy || { createdAt: "desc" },
  };

  const [roles, total] = await Promise.all([prisma.role.findMany(finalOptions), prisma.role.count({ where: finalOptions.where })]);

  return { roles, total };
};

export const getRoleById = async (id: string) => {
  return await prisma.role.findUnique({
    where: { id },
    include: {
      _count: { select: { users: true } },
      cardCategoryRoleAccesses: { select: { categoryId: true, category: true } },
      roleMenuAccesses: { include: { menu: true } },
      roleApiAccesses: { include: { apiEndpoints: true } },
    },
  });
};

export const createRole = async ({ name, categoryIds = [], menuIds = [], apiAccesses = [] }: CreateRoleParams) => {
  const existingRole = await prisma.role.findUnique({ where: { name } });
  if (existingRole) throw new Error("Role name already exists");

  return await prisma.$transaction(async (tx) => {
    const role = await tx.role.create({
      data: {
        name,
        cardCategoryRoleAccesses: {
          create: categoryIds.map((catId) => ({ categoryId: catId })),
        },
        roleMenuAccesses: {
          create: menuIds.map((id) => ({ menuId: id })),
        },
      },
    });

    for (const api of apiAccesses) {
      const endpoint = await tx.apiEndpoint.upsert({
        where: { url: api.url },
        update: {},
        create: { url: api.url, description: api.description || "" },
      });

      await tx.roleApiAccess.create({
        data: {
          roleId: role.id,
          apiEndpointId: endpoint.id,
          canRead: api.canRead,
          canCreate: api.canCreate,
          canUpdate: api.canUpdate,
          canDelete: api.canDelete,
        },
      });
    }

    return role;
  });
};

export const updateRole = async ({ id, name, categoryIds, menuIds, apiAccesses }: UpdateRoleParams) => {
  const existingRole = await prisma.role.findUnique({ where: { id } });
  if (!existingRole) throw new Error("Role not found");

  if (name && name !== existingRole.name) {
    const nameExists = await prisma.role.findUnique({ where: { name } });
    if (nameExists) throw new Error("Role name already exists");
  }

  return await prisma.$transaction(async (tx) => {
    await tx.role.update({
      where: { id },
      data: { ...(name && { name }) },
    });

    if (categoryIds !== undefined) {
      await tx.cardCategoryRoleAccess.deleteMany({ where: { roleId: id } });
      if (categoryIds.length > 0) {
        await tx.cardCategoryRoleAccess.createMany({
          data: categoryIds.map((catId) => ({ roleId: id, categoryId: catId })),
        });
      }
    }

    if (menuIds !== undefined) {
      await tx.roleMenuAccess.deleteMany({ where: { roleId: id } });
      if (menuIds.length > 0) {
        await tx.roleMenuAccess.createMany({
          data: menuIds.map((mId) => ({ roleId: id, menuId: mId })),
        });
      }
    }

    if (apiAccesses !== undefined) {
      await tx.roleApiAccess.deleteMany({ where: { roleId: id } });

      for (const api of apiAccesses) {
        const endpoint = await tx.apiEndpoint.upsert({
          where: { url: api.url },
          update: {},
          create: { url: api.url, description: api.description || "" },
        });

        await tx.roleApiAccess.create({
          data: {
            roleId: id,
            apiEndpointId: endpoint.id,
            canRead: api.canRead,
            canCreate: api.canCreate,
            canUpdate: api.canUpdate,
            canDelete: api.canDelete,
          },
        });
      }
    }

    return await tx.role.findUnique({
      where: { id },
      include: {
        cardCategoryRoleAccesses: { include: { category: true } },
        roleMenuAccesses: { include: { menu: true } },
        roleApiAccesses: { include: { apiEndpoints: true } },
      },
    });
  });
};

export const deleteRole = async (id: string) => {
  const existingRole = await prisma.role.findUnique({
    where: { id },
    include: { _count: { select: { users: true } } },
  });

  if (!existingRole) throw new Error("Role not found");
  if (existingRole._count.users > 0) {
    throw new Error("Cannot delete role: It is assigned to one or more users");
  }

  return await prisma.role.delete({ where: { id } });
};
