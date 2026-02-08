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
    const idCard = parseInt(id);

    if (isNaN(idCard)) {
      return sendResponse({ success: false, message: "Invalid ID", status: 400 });
    }

    const card = await prisma.card.findUnique({
      where: { idCard },
      include: {
        detail: { include: { image: true } },
        typeCard: true,
      },
    });

    if (!card) {
      return sendResponse({ success: false, message: "Card not found", status: 404 });
    }

    return sendResponse({ success: true, message: "Card fetched", data: card });
  } catch (err) {
    return handleApiError(err);
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteParams) => {
  let newFilePath: string | null = null;

  try {
    const { id } = await params;
    const idCard = Number(id);
    if (isNaN(idCard)) return sendResponse({ success: false, message: "Invalid ID", status: 400 });

    const oldCard = await prisma.card.findUnique({
      where: { idCard },
      include: { detail: { include: { image: true } } },
    });

    if (!oldCard) return sendResponse({ success: false, message: "Card not found", status: 404 });

    const formData = await req.formData();

    const getNumber = (key: string) => {
      const val = formData.get(key);
      if (!val || val.toString().trim() === "") return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    };

    const name = formData.get("name") as string;
    const price = getNumber("price");
    const stock = getNumber("stock");
    const idDiscount = getNumber("idDiscount");
    const idTypeCard = getNumber("idTypeCard");
    const note = (formData.get("note") as string) || "";
    const file = formData.get("image") as File | null;

    if (price !== undefined && price < 0) return sendResponse({ success: false, message: "Price cannot be negative", status: 400 });
    if (stock !== undefined && stock < 0) return sendResponse({ success: false, message: "Stock cannot be negative", status: 400 });

    let idImageNew: number | null | undefined = undefined;

    if (file && file.size > 0) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!allowedTypes.includes(file.type)) return sendResponse({ success: false, message: "Invalid image type", status: 400 });
      if (file.size > 5 * 1024 * 1024) return sendResponse({ success: false, message: "Image too large (max 5MB)", status: 400 });

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

      const filename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      const relativePath = `/uploads/${filename}`;
      const absolutePath = path.join(uploadDir, filename);

      newFilePath = absolutePath;

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(absolutePath, buffer);

      const newImageRecord = await prisma.image.create({
        data: { name: filename, location: relativePath },
      });
      idImageNew = newImageRecord.idImage;
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.detailCard.update({
        where: { idDetail: oldCard.idDetail },
        data: {
          ...(name && { name }),
          ...(price !== undefined && { price }),
          ...(stock !== undefined && { stock }),
          ...(idDiscount !== undefined ? { idDiscount } : formData.has("idDiscount") ? { idDiscount: null } : {}),
          note,
          ...(idImageNew !== undefined && { idImage: idImageNew }),
        },
      });

      if (idTypeCard !== undefined) {
        await tx.card.update({
          where: { idCard },
          data: { idTypeCard },
        });
      }

      if (idImageNew !== undefined && oldCard.detail.image) {
        await tx.image.delete({
          where: { idImage: oldCard.detail.image.idImage },
        });
      }

      return await tx.card.findUnique({
        where: { idCard },
        include: { detail: { include: { image: true } }, typeCard: true },
      });
    });

    if (idImageNew !== undefined && oldCard.detail.image) {
      const oldPath = path.join(process.cwd(), "public", oldCard.detail.image.location);
      if (existsSync(oldPath)) {
        try {
          await unlink(oldPath);
        } catch (e) {
          console.error("Failed to delete old file:", e);
        }
      }
    }

    return sendResponse({ success: true, message: "Card updated successfully", data: result });
  } catch (err: any) {
    if (newFilePath && existsSync(newFilePath)) {
      await unlink(newFilePath).catch(console.error);
    }
    if (err.code === "P2003") {
      return sendResponse({ success: false, message: "Invalid TypeCard or Discount ID", status: 400 });
    }
    return handleApiError(err);
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteParams) => {
  try {
    const { id } = await params;
    const idCard = parseInt(id);
    if (isNaN(idCard)) return sendResponse({ success: false, message: "Invalid ID", status: 400 });

    const card = await prisma.card.findUnique({
      where: { idCard },
      include: { detail: { include: { image: true } } },
    });

    if (!card) return sendResponse({ success: false, message: "Card not found", status: 404 });

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
        await unlink(absolutePath).catch(console.error);
      }
    }

    return sendResponse({ success: true, message: "Card deleted successfully" });
  } catch (err: any) {
    return handleApiError(err);
  }
};
