import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { CONSTANT } from "@/app/constants";

export const POST = async (req: NextRequest) => {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const defaultIdRole = await prisma.appConfig.findFirst({ where: { code: CONSTANT.APP_CONFIG.DEFAULT_ID_ROLE_CODE } });
    if (!defaultIdRole) {
      throw new Error(`Missing required AppConfig: ${CONSTANT.APP_CONFIG.DEFAULT_ID_ROLE_CODE}`);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendResponse({
        success: false,
        message: "Email already registered",
        status: 400,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        idRole: Number(defaultIdRole.value),
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return sendResponse({
      success: true,
      message: "Registration successful",
      data: userWithoutPassword,
      status: 201,
    });
  } catch (err) {
    return handleApiError(err);
  }
};
