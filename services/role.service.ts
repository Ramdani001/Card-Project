import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";

export const getRoles = async (options: Prisma.RoleFindManyArgs) => {
  const finalOptions: Prisma.RoleFindManyArgs = {
    ...options,
    where: {
      ...options.where,
      isActive: true,
    },
    include: {
      _count: { select: { users: true } },
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
    },
  });
};

export const createRole = async (name: string) => {
  const existingRole = await prisma.role.findUnique({
    where: { name },
  });

  if (existingRole) {
    throw new Error("Role name already exists");
  }

  return await prisma.role.create({
    data: { name },
  });
};

export const updateRole = async (id: string, name?: string, isActive?: boolean) => {
  const existingRole = await prisma.role.findUnique({ where: { id } });
  if (!existingRole) throw new Error("Role not found");

  if (name && name !== existingRole.name) {
    const nameExists = await prisma.role.findUnique({ where: { name } });
    if (nameExists) throw new Error("Role name already exists");
  }

  return await prisma.role.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(isActive !== undefined && { isActive }),
    },
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

  return await prisma.role.update({
    where: { id },
    data: { isActive: false },
  });
};
