import prisma from "@/lib/prisma";
import { hashPassword } from "@/helpers/auth.helper";
import { Prisma } from "@/prisma/generated/prisma/client";
import { deleteFile, saveFile } from "@/helpers/file.helper";

interface CreateUserParams {
  name: string;
  email: string;
  password: string;
  phone?: string;
  roleId?: string;
  file?: File | null;
}

interface UpdateUserParams {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  roleId?: string;
  file?: File | null;
}

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

export const getUsers = async (options: Prisma.UserFindManyArgs) => {
  const finalOptions: Prisma.UserFindManyArgs = {
    ...options,
    select: userSelectScope,
  };

  const [users, total] = await Promise.all([prisma.user.findMany(finalOptions), prisma.user.count({ where: options.where })]);

  return { users, total };
};

export const createUser = async (data: CreateUserParams) => {
  const { email, password, name, phone, roleId, file } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await hashPassword(password);
  let avatarUrl: string | null = null;

  try {
    if (file && file.size > 0) {
      const uploadResult = await saveFile(file);
      avatarUrl = uploadResult.relativePath;
    }

    return await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        roleId: roleId || null,
        avatar: avatarUrl,
      },
      select: userSelectScope,
    });
  } catch (error) {
    if (avatarUrl) {
      await deleteFile(avatarUrl).catch(console.error);
    }
    throw error;
  }
};

export const updateUser = async ({ id, name, email, phone, password, roleId, file }: UpdateUserParams) => {
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

  let newAvatarUrl: string | null = null;

  try {
    if (file && file.size > 0) {
      const uploadResult = await saveFile(file);
      newAvatarUrl = uploadResult.relativePath;
      updateData.avatar = newAvatarUrl;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: userSelectScope,
    });

    if (newAvatarUrl && existingUser.avatar) {
      await deleteFile(existingUser.avatar).catch(console.error);
    }

    return updatedUser;
  } catch (error) {
    if (newAvatarUrl) {
      await deleteFile(newAvatarUrl).catch(console.error);
    }
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) throw new Error("User not found");

  const deletedUser = await prisma.user.delete({
    where: { id },
  });

  if (existingUser.avatar) {
    await deleteFile(existingUser.avatar).catch(console.error);
  }

  return deletedUser;
};
