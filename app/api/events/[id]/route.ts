import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { idEvent: parseInt(id) },
      include: {
        images: true,
      },
    });

    if (!event) {
      return sendResponse({
        success: false,
        message: "Event not found",
        status: 404,
      });
    }

    return sendResponse({
      success: true,
      message: "Event detail fetched successfully",
      data: event,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  const savedFilePaths: string[] = [];

  try {
    const { id } = await params;

    const existingEvent = await prisma.event.findUnique({
      where: { idEvent: parseInt(id) },
    });

    if (!existingEvent) {
      return sendResponse({ success: false, message: "Event not found", status: 404 });
    }

    const formData = await req.formData();

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;
    const newImageFiles = formData.getAll("images") as File[];

    const dataToUpdate: any = {};
    if (title) dataToUpdate.title = title;
    if (content) dataToUpdate.content = content;

    if (startDateStr) {
      const date = new Date(startDateStr);
      if (isNaN(date.getTime())) return sendResponse({ success: false, message: "Invalid startDate", status: 400 });
      dataToUpdate.startDate = date;
    }

    if (endDateStr) {
      const date = new Date(endDateStr);
      if (isNaN(date.getTime())) return sendResponse({ success: false, message: "Invalid endDate", status: 400 });
      dataToUpdate.endDate = date;
    }

    const imagesToCreate: { name: string; location: string }[] = [];

    if (newImageFiles && newImageFiles.length > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

      for (const file of newImageFiles) {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!allowedTypes.includes(file.type)) throw new Error(`File '${file.name}' invalid type`);
        if (file.size > 5 * 1024 * 1024) throw new Error(`File '${file.name}' too large`);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
        const relativePath = `/uploads/${filename}`;
        const absolutePath = path.join(uploadDir, filename);

        await writeFile(absolutePath, buffer);
        savedFilePaths.push(absolutePath); // Catat buat cleanup
        imagesToCreate.push({ name: filename, location: relativePath });
      }
    }

    const updatedEvent = await prisma.event.update({
      where: { idEvent: parseInt(id) },
      data: {
        ...dataToUpdate,
        images: imagesToCreate.length > 0 ? { create: imagesToCreate } : undefined,
      },
      include: { images: true },
    });

    return sendResponse({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (err: any) {
    if (savedFilePaths.length > 0) {
      for (const p of savedFilePaths) {
        if (existsSync(p)) await unlink(p).catch(console.error);
      }
    }
    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const idEvent = parseInt(id);

    const eventToDelete = await prisma.event.findUnique({
      where: { idEvent },
      include: { images: true },
    });

    if (!eventToDelete) {
      return sendResponse({ success: false, message: "Event not found", status: 404 });
    }

    await prisma.event.delete({
      where: { idEvent },
    });

    if (eventToDelete.images && eventToDelete.images.length > 0) {
      const publicDir = path.join(process.cwd(), "public");

      for (const img of eventToDelete.images) {
        const absolutePath = path.join(publicDir, img.location);

        if (existsSync(absolutePath)) {
          try {
            await unlink(absolutePath);
          } catch (unlinkErr) {
            console.error(`Failed to delete file: ${absolutePath}`, unlinkErr);
          }
        }
      }
    }

    return sendResponse({
      success: true,
      message: "Event and associated images deleted successfully",
    });
  } catch (err: any) {
    if (err.code === "P2003") {
      return sendResponse({
        success: false,
        message: "Constraint error: Cannot delete event.",
        status: 400,
      });
    }
    return handleApiError(err);
  }
};
