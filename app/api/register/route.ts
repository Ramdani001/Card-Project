import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { sendResponse } from "@/helpers/response.helper";

export const POST = async (req: NextRequest) => {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return sendResponse({
        success: false,
        message: "Email and password are required",
        status: 400,
      });
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
        idRole: 2,
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
    console.error(err);

    return sendResponse({
      success: false,
      message: "Internal server error during registration",
      status: 500,
    });
  }
};
