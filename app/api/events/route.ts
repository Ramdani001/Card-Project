import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getQueryPaginationOptions } from "@/helpers/pagination.helper";
import { handleApiError, sendResponse } from "@/helpers/response.helper";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export const GET = async (req: NextRequest) => {
  try {
    const { options, page, limit } = getQueryPaginationOptions(req);

    const queryOptions = {
      ...options,
      include: {
        images: true,
      },
      orderBy: options.orderBy || { startDate: "desc" },
    };

    if (options.take) {
      const countOptions = { where: options.where };

      const [events, total] = await Promise.all([prisma.event.findMany(queryOptions), prisma.event.count(countOptions)]);

      return sendResponse({
        success: true,
        message: "Events fetched successfully",
        data: events,
        metadata: {
          total,
          page: page || 1,
          limit: limit || 10,
          totalPages: Math.ceil(total / (limit || 10)),
        },
      });
    }

    const allEvents = await prisma.event.findMany(queryOptions);

    return sendResponse({
      success: true,
      message: "All events fetched successfully",
      data: allEvents,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const POST = async (req: NextRequest) => {
  const savedFilePaths: string[] = [];

  try {
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;

    if (!title || !content || !startDateStr || !endDateStr) {
      return sendResponse({
        success: false,
        message: "Title, Content, Start Date, and End Date are required",
        status: 400,
      });
    }

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return sendResponse({
        success: false,
        message: "Invalid date format",
        status: 400,
      });
    }

    const files = formData.getAll("images") as File[];
    const imagesToCreate: { name: string; location: string }[] = [];

    if (files && files.length > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads");

      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      for (const file of files) {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`File '${file.name}' must be an image (JPG, PNG, or WEBP)`);
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new Error(`File '${file.name}' is too large (max 5MB)`);
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
        const relativePath = `/uploads/${filename}`;
        const absolutePath = path.join(uploadDir, filename);

        await writeFile(absolutePath, buffer);

        savedFilePaths.push(absolutePath);
        imagesToCreate.push({ name: filename, location: relativePath });
      }
    }

    const newEvent = await prisma.$transaction(async (tx) => {
      return await tx.event.create({
        data: {
          title,
          content,
          startDate: start,
          endDate: end,
          images:
            imagesToCreate.length > 0
              ? {
                  create: imagesToCreate,
                }
              : undefined,
        },
        include: {
          images: true,
        },
      });
    });

    return sendResponse({
      success: true,
      message: "Event created successfully",
      data: newEvent,
      status: 201,
    });
  } catch (err: any) {
    if (savedFilePaths.length > 0) {
      for (const filePath of savedFilePaths) {
        if (existsSync(filePath)) {
          try {
            await unlink(filePath);
          } catch (unlinkErr) {
            console.error(`Failed to delete file: ${filePath}`, unlinkErr);
          }
        }
      }
    }

    return handleApiError(err);
  }
};
