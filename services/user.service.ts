import prisma from "@/lib/prisma";
import { hashPassword } from "@/helpers/auth.helper";
import { Prisma } from "@/prisma/generated/prisma/client";

const userSelectScope = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatar: true,
  role: {
    select: { id: true, name: true },
  },
  createdAt: true,
};

export const getUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
    select: userSelectScope,
  });
};

export const updateUser = async (id: string, data: any) => {
  const { name, email, phone, password, roleId } = data;

  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) throw new Error("User not found");

  const updateData: any = {
    ...(name && { name }),
    ...(email && { email }),
    ...(phone && { phone }),
    ...(roleId && { roleId }),
  };

  if (password) {
    updateData.password = await hashPassword(password);
  }

  return await prisma.user.update({
    where: { id },
    data: updateData,
    select: userSelectScope,
  });
};

export const deleteUser = async (id: string) => {
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) throw new Error("User not found");

  return await prisma.user.delete({
    where: { id },
  });
};

export const getUsers = async (options: Prisma.UserFindManyArgs) => {
  const finalOptions: Prisma.UserFindManyArgs = {
    ...options,
    select: userSelectScope,
  };

  const [users, total] = await Promise.all([prisma.user.findMany(finalOptions), prisma.user.count({ where: options.where })]);

  return { users, total };
};

export const createUser = async (data: any) => {
  const { email, password, name, phone, roleId } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await hashPassword(password);

  return await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      phone,
      roleId: roleId || null,
    },
    select: userSelectScope,
  });
};
