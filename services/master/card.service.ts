import { deleteFile, saveFile } from "@/helpers/file.helper";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { generateSlug } from "@/utils";

interface CreateCardParams {
  name: string;
  price: number;
  stock: number;
  categoryIds: string[];
  discountId?: string | null;
  description?: string;
  sku?: string;
  file: File;
  userId: string;
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
  userId: string;
}

export const getCards = async (options: Prisma.CardFindManyArgs, userId?: string) => {
  const defaultInclude: Prisma.CardInclude = {
    images: true,
    discount: true,
    categories: {
      include: { category: true },
    },
  };

  const baseWhere: Prisma.CardWhereInput = { ...options.where };

  let categorySearchFilter: Prisma.CardWhereInput = {};
  const filterStock: Prisma.CardWhereInput = {};

  const rawStock = (baseWhere as any).stock;
  delete baseWhere.stock;

  if (rawStock?.contains === "on") {
    filterStock.stock = { gt: 0 };
  } else if (rawStock?.contains === "off") {
    filterStock.stock = 0;
  } else if (!isNaN(Number(rawStock)) && rawStock !== undefined) {
    filterStock.stock = Number(rawStock);
  }

  if (baseWhere.categories) {
    const categoryFilter = baseWhere.categories as any;
    const keyword = categoryFilter.contains || categoryFilter;

    if (typeof keyword === "string") {
      const keywords = keyword
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k !== "");

      if (keywords.length > 0) {
        categorySearchFilter = {
          categories: {
            some: {
              category: {
                OR: keywords.map((k) => ({
                  name: {
                    contains: k,
                    mode: "insensitive" as const,
                  },
                })),
              },
            },
          },
        };
      }

      delete baseWhere.categories;
    }
  }

  let roleSecurityFilter: Prisma.CardWhereInput = {};

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: { cardCategoryRoleAccesses: true },
        },
      },
    });

    if (user && user.role) {
      const allowedCategoryIds = user.role.cardCategoryRoleAccesses.map((access) => access.categoryId);

      roleSecurityFilter = {
        OR: [
          {
            categories: {
              some: { categoryId: { in: allowedCategoryIds } },
            },
          },
          {
            categories: { none: {} },
          },
        ],
      };
    }
  } else {
    const singleCardCategory = await prisma.category.findFirst({
      where: { name: "Single Card" },
    });

    if (singleCardCategory) {
      roleSecurityFilter = {
        OR: [
          {
            categories: {
              some: { categoryId: singleCardCategory.id },
            },
          },
          {
            categories: { none: {} },
          },
        ],
      };
    } else {
      roleSecurityFilter = {
        categories: { none: {} },
      };
    }
  }

  const finalWhereClause: Prisma.CardWhereInput = {
    AND: [baseWhere, categorySearchFilter, roleSecurityFilter, filterStock],
  };

  const finalOptions: Prisma.CardFindManyArgs = {
    ...options,
    where: finalWhereClause,
    include: {
      ...defaultInclude,
      ...((options.include as Prisma.CardInclude) || {}),
    },
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

  let uploadedFileUrl: string | null = null;

  try {
    const fileData = await saveFile(file);
    uploadedFileUrl = fileData.path;

    const slug = generateSlug(name);

    const newCard = await prisma.$transaction(async (tx) => {
      const card = await tx.card.create({
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
              ...fileData,
              isPrimary: true,
            },
          },
        },
        include: {
          images: true,
          categories: true,
        },
      });

      return card;
    });

    return newCard;
  } catch (error) {
    if (uploadedFileUrl) {
      await deleteFile(uploadedFileUrl).catch((err) => console.error("Gagal cleanup file Supabase setelah error DB:", err));
    }
    throw error;
  }
};

export const updateCard = async (params: UpdateCardParams) => {
  const { id, name, price, stock, categoryIds, discountId, description, sku, file, userId } = params;

  const existingCard = await prisma.card.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!existingCard) throw new Error("Card not found");

  let fileData: any = null;
  let newUploadedPath: string | null = null;

  if (file && file.size > 0) {
    fileData = await saveFile(file);
    newUploadedPath = fileData.path;
  }

  try {
    const updatedCard = await prisma.$transaction(async (tx) => {
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
          changedBy: userId,
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

      if (fileData) {
        await tx.imageCard.deleteMany({ where: { cardId: id } });

        await tx.imageCard.create({
          data: {
            ...fileData,
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

    if (fileData && existingCard.images.length > 0) {
      for (const img of existingCard.images) {
        await deleteFile(img.path).catch(console.error);
      }
    }

    return updatedCard;
  } catch (error) {
    if (newUploadedPath) {
      await deleteFile(newUploadedPath).catch(console.error);
    }
    throw error;
  }
};

export const deleteCard = async (id: string) => {
  const card = await prisma.card.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!card) throw new Error("Card not found");

  const deleted = await prisma.card.delete({
    where: { id },
  });

  if (card.images.length > 0) {
    for (const img of card.images) {
      await deleteFile(img.path).catch(console.error);
    }
  }

  return deleted;
};
