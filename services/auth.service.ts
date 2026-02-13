import prisma from "@/lib/prisma";
import { hashPassword } from "@/helpers/auth.helper";

interface RegisterParams {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

export const register = async (params: RegisterParams) => {
  const { email, password, name, phone } = params;

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

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      phone,
      roleId: defaultRole.id,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: {
        select: { name: true },
      },
    },
  });

  return newUser;
};
