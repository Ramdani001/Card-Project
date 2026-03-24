import prisma from "@/lib/prisma";
import { hashPassword } from "@/helpers/auth.helper";
import { saveFile, deleteFile } from "@/helpers/file.helper";

interface RegisterParams {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  file?: File | null;
}

interface UpdateProfileParams {
  userId: string;
  email?: string;
  name?: string;
  phone?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  file?: File | null;
}

export const register = async ({ email, password, name, phone, file, facebookUrl, instagramUrl, twitterUrl }: RegisterParams) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await hashPassword(password);

  let defaultRole = await prisma.role.findUnique({
    where: { name: "B2C" },
  });

  if (!defaultRole) {
    const anyRole = await prisma.role.findFirst();
    if (!anyRole) throw new Error("No roles found in system. Please seed database.");
    defaultRole = anyRole;
  }

  let avatarUrl: string | null = null;

  try {
    if (file && file.size > 0) {
      const uploadResult = await saveFile(file);
      avatarUrl = uploadResult.path;
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        facebookUrl,
        twitterUrl,
        instagramUrl,
        roleId: defaultRole.id,
        avatar: avatarUrl,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: {
          select: { name: true },
        },
      },
    });

    return newUser;
  } catch (error) {
    if (avatarUrl) {
      await deleteFile(avatarUrl).catch(console.error);
    }
    throw error;
  }
};

export const updateProfile = async ({ userId, email, name, phone, file, facebookUrl, twitterUrl, instagramUrl }: UpdateProfileParams) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User tidak ditemukan");

  if (email && email !== user.email) {
    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) throw new Error("Email sudah digunakan oleh akun lain");
  }

  let newAvatarUrl: string | null = null;

  try {
    if (file && file.size > 0) {
      const uploadResult = await saveFile(file);
      newAvatarUrl = uploadResult.url;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email: email ?? user.email,
        name: name ?? user.name,
        phone: phone ?? user.phone,
        facebookUrl: facebookUrl ?? user.facebookUrl,
        twitterUrl: twitterUrl ?? user.twitterUrl,
        instagramUrl: instagramUrl ?? user.instagramUrl,
        avatar: newAvatarUrl ?? user.avatar,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: {
          select: { name: true },
        },
      },
    });

    if (newAvatarUrl && user.avatar) {
      await deleteFile(user.avatar.replace(/[\\/]uploads[\\/]/g, "")).catch(console.error);
    }

    return updatedUser;
  } catch (error) {
    if (newAvatarUrl) {
      await deleteFile(newAvatarUrl.replace(/[\\/]uploads[\\/]/g, "")).catch(console.error);
    }
    throw error;
  }
};

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      avatar: true,
      facebookUrl: true,
      instagramUrl: true,
      twitterUrl: true,
      role: {
        select: { name: true },
      },
    },
  });

  if (!user) throw new Error("User tidak ditemukan");

  return user;
};
