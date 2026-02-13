import prisma from "@/lib/prisma";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { Prisma } from "@/prisma/generated/prisma/client";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

interface CreateCardParams {
  name: string;
  price: number;
  stock: number;
  categoryIds: string[];
  discountId?: string | null;
  description?: string;
  sku?: string;
  file: File;
}

interface UpdateCardParams {
  id: string;
  name?: string;
  price?: number;
  stock?: number;
  categoryIds?: string[];
  discountId?: string | null;
  description?: string;
  sku?: string;
  file?: File | null;
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const saveFile = async (file: File) => {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const relativePath = `/uploads/${filename}`;
  const absolutePath = path.join(UPLOAD_DIR, filename);

  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }

  await writeFile(absolutePath, buffer);
  return { filename, relativePath, absolutePath };
};

const deleteFile = async (relativePath: string) => {
  if (!relativePath) return;
  const absolutePath = path.join(process.cwd(), "public", relativePath);
  if (existsSync(absolutePath)) {
    await unlink(absolutePath).catch(() => {});
  }
};

export const getCards = async (options: Prisma.CardFindManyArgs) => {
  const defaultInclude: Prisma.CardInclude = {
    images: true,
    discount: true,
    categories: {
      include: { category: true },
    },
  };

  const finalOptions: Prisma.CardFindManyArgs = {
    ...options,
    include: { ...defaultInclude, ...(options.include || {}) },
  };

  const [cards, total] = await Promise.all([prisma.card.findMany(finalOptions), prisma.card.count({ where: finalOptions.where })]);

  return { cards, total };
};

export const getCardById = async (id: string) => {
  return await prisma.card.findUnique({
    where: { id },
    include: {
      images: true,
      categories: { include: { category: true } },
      discount: true,
      histories: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
};

export const createCard = async (params: CreateCardParams) => {
  const { name, price, stock, categoryIds, discountId, description, sku, file } = params;

  if (categoryIds.length > 0) {
    const count = await prisma.category.count({ where: { id: { in: categoryIds } } });
    if (count !== categoryIds.length) throw new Error("One or more Category IDs are invalid");
  }

  if (discountId) {
    const disc = await prisma.discount.findUnique({ where: { id: discountId } });
    if (!disc) throw new Error("Invalid Discount ID");
  }

  let uploadedFile = null;

  try {
    uploadedFile = await saveFile(file);
    const slug = generateSlug(name);

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return await tx.card.create({
        data: {
          name,
          slug,
          price: new Prisma.Decimal(price),
          stock,
          description,
          sku,
          discountId: discountId || null,
          categories: {
            create: categoryIds.map((id) => ({ categoryId: id })),
          },
          images: {
            create: {
              url: uploadedFile!.relativePath,
              isPrimary: true,
            },
          },
        },
        include: {
          images: true,
          categories: true,
        },
      });
    });
  } catch (error) {
    if (uploadedFile) {
      await unlink(uploadedFile.absolutePath).catch(() => {});
    }
    throw error;
  }
};

export const updateCard = async (params: UpdateCardParams) => {
  const { id, name, price, stock, categoryIds, discountId, description, sku, file } = params;

  const existingCard = await prisma.card.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!existingCard) throw new Error("Card not found");

  let newUploadedFile = null;
  if (file && file.size > 0) {
    newUploadedFile = await saveFile(file);
  }

  try {
    const updatedCard = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.cardHistory.create({
        data: {
          cardId: existingCard.id,
          name: existingCard.name,
          price: existingCard.price,
          stock: existingCard.stock,
          description: existingCard.description,
          sku: existingCard.sku,
          discountId: existingCard.discountId,
          changeType: "UPDATE",
          changedBy: "SYSTEM",
        },
      });

      const slug = name ? generateSlug(name) : undefined;

      await tx.card.update({
        where: { id },
        data: {
          ...(name && { name, slug }),
          ...(price !== undefined && { price: new Prisma.Decimal(price) }),
          ...(stock !== undefined && { stock }),
          ...(description && { description }),
          ...(sku && { sku }),
          discountId: discountId === undefined ? undefined : discountId,
        },
      });

      if (categoryIds) {
        await tx.categoriesOnCards.deleteMany({ where: { cardId: id } });
        if (categoryIds.length > 0) {
          await tx.categoriesOnCards.createMany({
            data: categoryIds.map((catId) => ({
              cardId: id,
              categoryId: catId,
            })),
          });
        }
      }

      if (newUploadedFile) {
        await tx.imageCard.deleteMany({ where: { cardId: id } });
        await tx.imageCard.create({
          data: {
            url: newUploadedFile.relativePath,
            cardId: id,
            isPrimary: true,
          },
        });
      }

      return await tx.card.findUnique({
        where: { id },
        include: {
          images: true,
          categories: { include: { category: true } },
          discount: true,
        },
      });
    });

    if (newUploadedFile && existingCard.images.length > 0) {
      for (const img of existingCard.images) {
        await deleteFile(img.url);
      }
    }

    return updatedCard;
  } catch (error) {
    if (newUploadedFile) {
      await unlink(newUploadedFile.absolutePath).catch(() => {});
    }
    throw error;
  }
};

export const deleteCard = async (id: string) => {
  const card = await prisma.card.findUnique({ where: { id } });
  if (!card) throw new Error("Card not found");

  await prisma.cardHistory.create({
    data: {
      cardId: card.id,
      name: card.name,
      price: card.price,
      stock: card.stock,
      description: card.description,
      sku: card.sku,
      discountId: card.discountId,
      changeType: "DELETE",
      changedBy: "SYSTEM",
    },
  });

  return await prisma.card.update({
    where: { id },
    data: { isActive: false },
  });
};

export const forceDeleteCard = async (id: string) => {
  const card = await prisma.card.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!card) throw new Error("Card not found");

  await prisma.card.delete({ where: { id } });

  if (card.images.length > 0) {
    for (const img of card.images) {
      await deleteFile(img.url);
    }
  }
  return true;
};
