import prisma from "@/lib/prisma";
import { hashPassword } from "@/helpers/auth.helper";
import { saveFile, deleteFile } from "@/helpers/file.helper";

interface RegisterParams {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  file?: File | null;
}

export const register = async ({ email, password, name, phone, file }: RegisterParams) => {
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
      avatarUrl = uploadResult.relativePath;
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
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
