import prisma from "@/lib/prisma";
import { hashPassword } from "@/helpers/auth.helper";
import { Prisma } from "@/prisma/generated/prisma/client";
import { deleteFile, saveFile } from "@/helpers/file.helper";
import { logError } from "@/lib/logger";
import { CreateUserParams, UpdateUserParams } from "@/types/params/userParams";

const userSelectScope = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatar: true,
  facebookUrl: true,
  instagramUrl: true,
  twitterUrl: true,
  isVerified: true,
  address: true,
  countryIsoCode: true,
  provinceCode: true,
  cityCode: true,
  subDistrictCode: true,
  villageCode: true,
  postalCode: true,
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
  const {
    email,
    password,
    name,
    phone,
    roleId,
    file,
    facebookUrl,
    instagramUrl,
    twitterUrl,
    address,
    countryIsoCode,
    provinceCode,
    cityCode,
    subDistrictCode,
    villageCode,
    postalCode,
  } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await hashPassword(password);
  let avatarUrl: string | null = null;
  let avatarPath: string | null = null;

  try {
    if (file && file.size > 0) {
      const uploadResult = await saveFile(file, "avatars");
      avatarUrl = uploadResult.url;
      avatarPath = uploadResult.path;
    }

    return await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        roleId: roleId || null,
        avatar: avatarUrl,
        facebookUrl,
        instagramUrl,
        twitterUrl,
        address,
        countryIsoCode,
        provinceCode,
        cityCode,
        subDistrictCode,
        villageCode,
        postalCode,
      },
      select: userSelectScope,
    });
  } catch (error) {
    if (avatarPath) {
      await deleteFile(avatarPath).catch(console.error);
    }

    logError("UserService.createUser", error);
    throw error;
  }
};

export const updateUser = async (data: UpdateUserParams) => {
  const {
    id,
    name,
    email,
    phone,
    password,
    roleId,
    file,
    facebookUrl,
    instagramUrl,
    twitterUrl,
    address,
    countryIsoCode,
    provinceCode,
    cityCode,
    subDistrictCode,
    villageCode,
    postalCode,
  } = data;

  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) throw new Error("User not found");

  const updateData: any = {
    ...(name && { name }),
    ...(email && { email }),
    ...(phone && { phone }),
    ...(roleId && { roleId }),
    ...(facebookUrl && { facebookUrl }),
    ...(instagramUrl && { instagramUrl }),
    ...(twitterUrl && { twitterUrl }),
    ...(address && { address }),
    ...(countryIsoCode && { countryIsoCode }),
    ...(provinceCode && { provinceCode }),
    ...(cityCode && { cityCode }),
    ...(subDistrictCode && { subDistrictCode }),
    ...(villageCode && { villageCode }),
    ...(postalCode && { postalCode }),
  };

  if (password) {
    updateData.password = await hashPassword(password);
  }

  let newAvatarUrl: string | null = null;
  let newAvatarPath: string | null = null;

  try {
    if (file && file.size > 0) {
      const uploadResult = await saveFile(file, "avatars");
      newAvatarUrl = uploadResult.url;
      newAvatarPath = uploadResult.path;

      updateData.avatar = newAvatarUrl;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: userSelectScope,
    });

    if (newAvatarPath && existingUser.avatar) {
      const oldPath = existingUser.avatar.replace(/^\/uploads\//, "");
      await deleteFile(oldPath).catch(console.error);
    }

    return updatedUser;
  } catch (error) {
    if (newAvatarPath) {
      await deleteFile(newAvatarPath).catch(console.error);
    }

    logError("UserService.updateUser", error);
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
    const oldPath = existingUser.avatar.replace(/^\/uploads\//, "");
    await deleteFile(oldPath).catch(console.error);
  }

  return deletedUser;
};
