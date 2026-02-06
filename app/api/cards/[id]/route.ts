import { handleApiError, sendResponse } from "@/helpers/response.helper";
import prisma from "@/lib/prisma";
import { existsSync } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import { NextRequest } from "next/server";
import path from "path";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export const GET = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;

    const card = await prisma.card.findUnique({
      where: { idCard: parseInt(id) },
      include: {
        detail: { include: { image: true } },
        typeCard: true,
      },
    });

    if (!card) {
      return sendResponse({
        success: false,
        message: "Card not found",
        status: 404,
      });
    }

    return sendResponse({
      success: true,
      message: "Card detail fetched successfully",
      data: card,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const PATCH = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  let newFilePath: string | null = null;

  try {
    const resolvedParams = await params;
    const idCard = Number(resolvedParams.id);

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const price = formData.has("price") ? Number(formData.get("price")) : undefined;
    const stock = formData.has("stock") ? Number(formData.get("stock")) : undefined;
    const idDiscount = formData.has("idDiscount") ? Number(formData.get("idDiscount")) : undefined;
    const idTypeCard = formData.has("idTypeCard") ? Number(formData.get("idTypeCard")) : undefined;
    const note = formData.get("note") as string;
    const file = formData.get("image") as File | null;

    const oldCard = await prisma.card.findUnique({
      where: { idCard },
      include: { detail: { include: { image: true } } },
    });

    if (!oldCard) {
      return sendResponse({ success: false, message: "Card not found", status: 404 });
    }

    let idImage: number | null | undefined = undefined;

    if (file && file.size > 0) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        return sendResponse({
          success: false,
          message: "File must be an image (JPG, PNG, or WEBP)",
          status: 400,
        });
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return sendResponse({
          success: false,
          message: "Image size must be less than 5MB",
          status: 400,
        });
      }

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

      const filename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      const absolutePath = path.join(uploadDir, filename);
      newFilePath = absolutePath;

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(absolutePath, buffer);

      const newImageRecord = await prisma.image.create({
        data: { name: filename, location: `/uploads/${filename}` },
      });
      idImage = newImageRecord.idImage;
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.detailCard.update({
        where: { idDetail: oldCard.idDetail },
        data: {
          name,
          price,
          stock,
          idDiscount,
          note,
          ...(idImage !== undefined && { idImage }),
        },
      });

      return await tx.card.update({
        where: { idCard },
        data: { idTypeCard },
        include: {
          detail: { include: { image: true } },
          typeCard: true,
        },
      });
    });

    if (idImage !== undefined && oldCard.detail.image) {
      const oldPath = path.join(process.cwd(), "public", oldCard.detail.image.location);
      if (existsSync(oldPath)) {
        await unlink(oldPath);
        await prisma.image.delete({ where: { idImage: oldCard.detail.image.idImage } });
      }
    }

    return sendResponse({ success: true, message: "Card updated successfully", data: result });
  } catch (err) {
    if (newFilePath && existsSync(newFilePath)) {
      await unlink(newFilePath).catch(console.error);
    }

    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const idCard = parseInt(id);

    const card = await prisma.card.findUnique({
      where: { idCard },
      include: {
        detail: {
          include: { image: true },
        },
      },
    });

    if (!card) {
      return sendResponse({ success: false, message: "Card not found", status: 404 });
    }

    const idDetail = card.idDetail;
    const imageInfo = card.detail?.image;

    await prisma.$transaction(async (tx) => {
      await tx.card.delete({ where: { idCard } });

      await tx.detailCard.delete({ where: { idDetail } });

      if (imageInfo) {
        await tx.image.delete({ where: { idImage: imageInfo.idImage } });
      }
    });

    if (imageInfo?.location) {
      const absolutePath = path.join(process.cwd(), "public", imageInfo.location);
      if (existsSync(absolutePath)) {
        await unlink(absolutePath);
      }
    }

    return sendResponse({
      success: true,
      message: "Card deleted successfully",
    });
  } catch (err) {
    return handleApiError(err);
  }
};
