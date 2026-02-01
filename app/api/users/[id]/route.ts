import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { handleApiError, sendResponse } from "@/helpers/response.helper";

type RouteParams = { params: Promise<{ id: string }> };

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: {
        idUsr: parseInt(id),
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      return sendResponse({
        success: false,
        message: "User not found",
        status: 404,
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    return sendResponse({
      success: true,
      message: "User detail fetched successfully",
      data: userWithoutPassword,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const { email, password, idRole } = body;

    const updateData: any = {};
    if (email) updateData.email = email;
    if (idRole) updateData.idRole = parseInt(idRole);
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { idUsr: parseInt(id) },
      data: updateData,
      include: { role: true },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    return sendResponse({
      success: true,
      message: "User updated successfully",
      data: userWithoutPassword,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    await prisma.user.delete({
      where: { idUsr: parseInt(id) },
    });

    return sendResponse({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err: any) {
    return handleApiError(err);
  }
};
