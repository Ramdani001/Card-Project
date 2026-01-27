import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { sendResponse } from "@/helpers/response.helper";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);

    const queryOptions = {
      ...options,
      include: { role: true },
    };

    const users = await prisma.user.findMany(queryOptions);

    const responseData = users.map(({ password: _, ...u }) => u);

    if (options.take) {
      const total = await prisma.user.count();
      return sendResponse({
        success: true,
        message: "All users fetched successfully",
        data: responseData,
        metadata: {
          total,
          page: page || 1,
          limit: limit || 10,
          totalPages: Math.ceil(total / (limit || 10)),
        },
      });
    }

    return sendResponse({
      success: true,
      message: "All users fetched successfully",
      data: responseData,
    });
  } catch (err) {
    console.error(err);

    return sendResponse({
      success: false,
      message: "Failed to fetch users",
      status: 500,
    });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const { email, password, idRole } = await req.json();

    if (!email || !password) {
      return sendResponse({
        success: false,
        message: "Email and password are required",
        status: 400,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        idRole: idRole ? parseInt(idRole) : null,
      },
      include: { role: true },
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return sendResponse({
      success: true,
      message: "User created successfully",
      data: userWithoutPassword,
      status: 201,
    });
  } catch (err: any) {
    console.error(err);
    
    return sendResponse({
      success: false,
      message: err.code === "P2002" ? "Email already registered" : "Internal server error",
      status: err.code === "P2002" ? 400 : 500,
    });
  }
};
