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

    const searchParams = req.nextUrl.searchParams;
    const sortBy = searchParams.get("sortBy");
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

    if (sortBy) {
      if (["name", "price", "stock"].includes(sortBy)) {
        options.orderBy = {
          detail: {
            [sortBy]: sortOrder,
          },
        };
      } else if (sortBy === "typeCard") {
        options.orderBy = {
          typeCard: {
            name: sortOrder,
          },
        };
      } else {
        options.orderBy = {
          [sortBy]: sortOrder,
        };
      }
    } else {
      options.orderBy = { idCard: "desc" };
    }

    options.include = {
      typeCard: true,
      detail: {
        include: {
          image: true,
          discount: true,
        },
      },
    };

    if (options.take) {
      const [cards, total] = await Promise.all([prisma.card.findMany(options), prisma.card.count({ where: options.where })]);

      return sendResponse({
        success: true,
        message: "All cards fetched successfully",
        data: cards,
        metadata: {
          total,
          page: page || 1,
          limit: limit || 10,
          totalPages: Math.ceil(total / (limit || 10)),
        },
      });
    }

    const allCard = await prisma.card.findMany({
      ...options,
    });

    return sendResponse({
      success: true,
      message: "All cards fetched successfully",
      data: allCard,
    });
  } catch (err) {
    return handleApiError(err);
  }
};

export const POST = async (req: NextRequest) => {
  let savedFilePath: string | null = null;

  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const priceRaw = formData.get("price");
    const stockRaw = formData.get("stock");
    const idTypeCardRaw = formData.get("idTypeCard");
    const idDiscountRaw = formData.get("idDiscount");
    const note = (formData.get("note") as string) || "";
    const file = formData.get("image") as File | null;

    if (!name || name.trim() === "") {
      return sendResponse({ success: false, message: "Card Name is required", status: 400 });
    }

    if (!priceRaw || isNaN(Number(priceRaw)) || Number(priceRaw) < 0) {
      return sendResponse({ success: false, message: "Valid Price is required (cannot be negative)", status: 400 });
    }
    if (!stockRaw || isNaN(Number(stockRaw)) || Number(stockRaw) < 0) {
      return sendResponse({ success: false, message: "Valid Stock is required (cannot be negative)", status: 400 });
    }

    if (!idTypeCardRaw || isNaN(Number(idTypeCardRaw))) {
      return sendResponse({ success: false, message: "Type Card is required", status: 400 });
    }

    if (!file || file.size === 0) {
      return sendResponse({ success: false, message: "Image is required", status: 400 });
    }

    const price = Number(priceRaw);
    const stock = Number(stockRaw);
    const idTypeCard = Number(idTypeCardRaw);
    const idDiscount = idDiscountRaw ? Number(idDiscountRaw) : null;

    let idImage: number | null = null;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return sendResponse({ success: false, message: "File must be an image (JPG, PNG, WEBP)", status: 400 });
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return sendResponse({ success: false, message: "Image size must be less than 5MB", status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const relativePath = `/uploads/${filename}`;
    const absolutePath = path.join(uploadDir, filename);

    savedFilePath = absolutePath;

    await writeFile(absolutePath, buffer);

    const newImage = await prisma.image.create({
      data: { name: filename, location: relativePath },
    });
    idImage = newImage.idImage;

    const result = await prisma.$transaction(async (tx) => {
      if (idDiscount) {
        const discount = await tx.discount.findUnique({ where: { idDiscount } });
        if (!discount) throw new Error("Invalid Discount ID");
      }

      const typeCard = await tx.typeCard.findUnique({ where: { idTypeCard } });
      if (!typeCard) throw new Error("Invalid Type Card ID");

      const newCardDetail = await tx.detailCard.create({
        data: {
          name,
          price,
          stock,
          idDiscount,
          note,
          idImage,
        },
      });

      return await tx.card.create({
        data: {
          idDetail: newCardDetail.idDetail,
          idTypeCard,
        },
        include: {
          detail: { include: { image: true } },
          typeCard: true,
        },
      });
    });

    return sendResponse({
      success: true,
      message: "Card created successfully",
      data: result,
      status: 201,
    });
  } catch (err: any) {
    if (savedFilePath && existsSync(savedFilePath)) {
      try {
        await unlink(savedFilePath);
      } catch (unlinkErr) {
        console.error("Failed to delete file during rollback:", unlinkErr);
      }
    }

    if (err.message === "Invalid Discount ID" || err.message === "Invalid Type Card ID") {
      return sendResponse({ success: false, message: err.message, status: 400 });
    }

    return handleApiError(err);
  }
};
