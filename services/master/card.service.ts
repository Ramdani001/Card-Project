import { deleteFile, saveFile } from "@/helpers/file.helper";
import prisma from "@/lib/prisma";
import { NotificationType, Prisma } from "@/prisma/generated/prisma/client";
import { generateSlug } from "@/utils";
import ExcelJS from "exceljs";
import { createNotificationByCode } from "../transaction/notification.service";
import { CONSTANT } from "@/constants";
import { logError } from "@/lib/logger";
import { CreateCardParams, UpdateCardParams } from "@/types/params/cardParams";

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

    if (user && user.role && user.role.name == CONSTANT.ROLE_ADMIN_NAME) {
      roleSecurityFilter = {};
    } else if (user && user.role) {
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
    const guestRole = await prisma.role.findUnique({
      where: { name: CONSTANT.ROLE_GUEST_NAME },
      include: { cardCategoryRoleAccesses: true },
    });

    if (guestRole && guestRole.cardCategoryRoleAccesses.length > 0) {
      const allowedCategoryIds = guestRole.cardCategoryRoleAccesses.map((access) => access.categoryId);

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
    } else {
      roleSecurityFilter = { id: { in: [] } };
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
  const { name, price, stock, categoryIds, discountId, description, sku, files, maxQtyPurchase, minQtyPurchase, primaryImageIndex = 0 } = params;

  if (categoryIds.length > 0) {
    const count = await prisma.category.count({ where: { id: { in: categoryIds } } });
    if (count !== categoryIds.length) throw new Error("One or more Category IDs are invalid");
  }

  if (discountId) {
    const disc = await prisma.discount.findUnique({ where: { id: discountId } });
    if (!disc) throw new Error("Invalid Discount ID");
  }

  const uploadedFileUrls: string[] = [];

  try {
    const uploadedImagesData = await Promise.all(
      files.map(async (file, index) => {
        const fileData = await saveFile(file, "cards");
        uploadedFileUrls.push(fileData.path);

        return {
          ...fileData,
          isPrimary: index === primaryImageIndex,
        };
      })
    );

    const slug = generateSlug(name);

    const newCard = await prisma.$transaction(async (tx) => {
      const card = await tx.card.create({
        data: {
          name,
          slug,
          price: new Prisma.Decimal(price),
          stock,
          description,
          maxQtyPurchase,
          minQtyPurchase,
          sku,
          discountId: discountId || null,
          categories: {
            create: categoryIds.map((id) => ({ categoryId: id })),
          },
          images: {
            create: uploadedImagesData,
          },
        },
        include: {
          images: true,
          categories: true,
        },
      });

      return card;
    });

    await createNotificationByCode({
      notificationCode: "PRODUCT_NOTIF",
      title: "Produk Baru",
      message: `Produk ${name} berhasil ditambahkan`,
      type: NotificationType.SYSTEM,
      url: null,
      metadata: { cardId: newCard.id },
    });

    return newCard;
  } catch (error) {
    if (uploadedFileUrls.length > 0) {
      await Promise.all(uploadedFileUrls.map((url) => deleteFile(url).catch(console.error)));
    }

    logError("CardService.createCard", error);
    throw error;
  }
};

export const updateCard = async (params: UpdateCardParams) => {
  const {
    id,
    name,
    price,
    stock,
    categoryIds,
    discountId,
    description,
    sku,
    files,
    keepImageIds = [],
    userId,
    maxQtyPurchase,
    minQtyPurchase,
    primaryImageId,
    primaryImageIndex,
  } = params;

  const existingCard = await prisma.card.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!existingCard) throw new Error("Card not found");

  let uploadedImagesData: any[] = [];
  const newUploadedPaths: string[] = [];

  if (files && files.length > 0) {
    uploadedImagesData = await Promise.all(
      files.map(async (file, index) => {
        const fileData = await saveFile(file, "cards");
        newUploadedPaths.push(fileData.path);
        return {
          ...fileData,
          isPrimary: primaryImageIndex !== undefined && index === primaryImageIndex,
        };
      })
    );
  }

  try {
    const updatedCard = await prisma.$transaction(async (tx) => {
      await tx.cardHistory.create({
        data: {
          cardId: existingCard.id,
          name: existingCard.name,
          price: existingCard.price,
          stock: existingCard.stock,
          maxQtyPurchase: existingCard.maxQtyPurchase || null,
          minQtyPurchase: existingCard.minQtyPurchase || null,
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
          ...(maxQtyPurchase && { maxQtyPurchase }),
          ...(minQtyPurchase && { minQtyPurchase }),
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

      await tx.imageCard.deleteMany({
        where: {
          cardId: id,
          id: { notIn: keepImageIds },
        },
      });

      if (uploadedImagesData.length > 0) {
        await tx.imageCard.createMany({
          data: uploadedImagesData.map((img) => ({
            ...img,
            cardId: id,
          })),
        });
      }

      await tx.imageCard.updateMany({
        where: { cardId: id },
        data: { isPrimary: false },
      });

      if (primaryImageId && keepImageIds.includes(primaryImageId)) {
        await tx.imageCard.update({
          where: { id: primaryImageId },
          data: { isPrimary: true },
        });
      } else if (primaryImageIndex !== undefined && uploadedImagesData.length > 0) {
        const newlyInsertedPrimary = await tx.imageCard.findFirst({
          where: {
            cardId: id,
            path: uploadedImagesData[primaryImageIndex].path,
          },
        });
        if (newlyInsertedPrimary) {
          await tx.imageCard.update({
            where: { id: newlyInsertedPrimary.id },
            data: { isPrimary: true },
          });
        }
      } else {
        const fallbackImage = await tx.imageCard.findFirst({
          where: { cardId: id },
        });
        if (fallbackImage) {
          await tx.imageCard.update({
            where: { id: fallbackImage.id },
            data: { isPrimary: true },
          });
        }
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

    const imagesToDelete = existingCard.images.filter((img) => !keepImageIds.includes(img.id));

    if (imagesToDelete.length > 0) {
      for (const img of imagesToDelete) {
        await deleteFile(img.path).catch(console.error);
      }
    }

    await createNotificationByCode({
      notificationCode: "PRODUCT_NOTIF",
      title: "Produk Diperbarui",
      message: `Produk ${existingCard.name} berhasil diperbarui`,
      type: NotificationType.SYSTEM,
      url: null,
      metadata: { cardId: id },
    });

    return updatedCard;
  } catch (error) {
    if (newUploadedPaths.length > 0) {
      await Promise.all(newUploadedPaths.map((path) => deleteFile(path).catch(console.error)));
    }

    logError("CardService.updateCard", error);
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

  await createNotificationByCode({
    notificationCode: "PRODUCT_NOTIF",
    title: "Produk Dihapus",
    message: `Produk ${card.name} telah dihapus`,
    type: NotificationType.SYSTEM,
    url: "",
    metadata: { cardId: card.id },
  });

  return deleted;
};

export const importCardsFromExcel = async (file: File, userId: string) => {
  const workbook = new ExcelJS.Workbook();
  const buffer = await file.arrayBuffer();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) throw new Error("Worksheet tidak ditemukan");

  const allCategories = await prisma.category.findMany();

  try {
    return await prisma.$transaction(
      async (tx) => {
        let successCount = 0;
        let updatedCount = 0;

        for (let i = 2; i <= worksheet.rowCount; i++) {
          const row = worksheet.getRow(i);
          const name = row.getCell(1).value?.toString()?.trim();
          const priceRaw = row.getCell(2).value;
          const categoryNamesRaw = row.getCell(5).value?.toString() || "";

          if (!name && !priceRaw) continue;

          const selectedCategoryNames = categoryNamesRaw
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s !== "");

          const invalidCategories: string[] = [];
          const matchedCategoryIds: string[] = [];

          for (const catName of selectedCategoryNames) {
            const found = allCategories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
            if (found) {
              matchedCategoryIds.push(found.id);
            } else {
              invalidCategories.push(catName);
            }
          }

          if (invalidCategories.length > 0) {
            throw new Error(`Baris ${i}: Kategori tidak ditemukan: [${invalidCategories.join(", ")}]. Pastikan kategori sudah terdaftar di sistem.`);
          }

          const stockRaw = row.getCell(3).value;
          const sku = row.getCell(4).value?.toString()?.trim();
          const description = row.getCell(6).value?.toString();
          const imageCell = row.getCell(7);

          if (!name || priceRaw === null) throw new Error(`Baris ${i}: Nama & Harga wajib.`);

          const slug = generateSlug(name);

          let imageUrl = "";
          if (imageCell.value && typeof imageCell.value === "object") {
            imageUrl = (imageCell.value as any).text || (imageCell.value as any).hyperlink || "";
          } else {
            imageUrl = imageCell.value?.toString() || "";
          }

          const existingCard = await tx.card.findFirst({
            where: {
              OR: [...(sku ? [{ sku }] : []), { slug }],
            },
          });

          const commonData = {
            name,
            price: new Prisma.Decimal(Number(priceRaw) || 0),
            stock: Number(stockRaw) || 0,
            description,
            sku: sku || null,
          };

          if (existingCard) {
            await tx.card.update({
              where: { id: existingCard.id },
              data: {
                ...commonData,
                categories: {
                  deleteMany: {},
                  create: matchedCategoryIds.map((id) => ({ categoryId: id })),
                },
                images: imageUrl
                  ? {
                      deleteMany: {},
                      create: { url: imageUrl, isPrimary: true },
                    }
                  : undefined,
                histories: {
                  create: {
                    name: existingCard.name,
                    price: existingCard.price,
                    stock: existingCard.stock,
                    changeType: "UPDATE_VIA_IMPORT",
                    changedBy: userId,
                  },
                },
              },
            });
            updatedCount++;
          } else {
            await tx.card.create({
              data: {
                ...commonData,
                slug,
                categories: {
                  create: matchedCategoryIds.map((id) => ({ categoryId: id })),
                },
                images: imageUrl
                  ? {
                      create: { url: imageUrl, isPrimary: true },
                    }
                  : undefined,
              },
            });
            successCount++;
          }
        }

        return { success: true, message: `Berhasil import ${successCount} data baru dan ${updatedCount} diperbarui.` };
      },
      { timeout: 300000 }
    );
  } catch (error) {
    logError("CardService.importCardsFromExcel", error);
    throw error;
  }
};

export const exportCardsToExcel = async () => {
  const cards = await prisma.card.findMany({
    include: {
      categories: { include: { category: true } },
      images: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data Card");

  worksheet.columns = [
    { header: "Card Name", key: "name", width: 30 },
    { header: "Price", key: "price", width: 15 },
    { header: "Stock", key: "stock", width: 10 },
    { header: "SKU", key: "sku", width: 20 },
    { header: "Category", key: "categories", width: 20 },
    { header: "Description", key: "description", width: 30 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];

    const row = worksheet.addRow({
      name: card.name,
      sku: card.sku || "-",
      price: Number(card.price),
      stock: card.stock,
      categories: card.categories.map((c) => c.category.name).join(", "),
      description: card.description,
    });

    row.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
  }

  worksheet.getColumn("price").numFmt = "#,##0";

  return await workbook.xlsx.writeBuffer();
};

export const generateCardTemplate = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Template Import");

  worksheet.columns = [
    { header: "Card Name*", key: "name", width: 30 },
    { header: "Price*", key: "price", width: 15 },
    { header: "Stock", key: "stock", width: 10 },
    { header: "SKU", key: "sku", width: 20 },
    { header: "Category", key: "category", width: 20 },
    { header: "Description", key: "description", width: 30 },
    { header: "Image URL", key: "image", width: 25 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "E67E22" } };

  return await workbook.xlsx.writeBuffer();
};

export const getTopThreeSellingCards = async () => {
  const topSellers = await prisma.transactionItem.groupBy({
    by: ["cardId"],
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: 3,
  });

  let cardIds = topSellers.map((item) => item.cardId).filter((id): id is string => id !== null);

  if (cardIds.length < 3) {
    const neededCount = 3 - cardIds.length;

    const randomCards = await prisma.card.findMany({
      where: {
        id: { notIn: cardIds },
      },
      select: { id: true },
      take: neededCount,
    });

    const randomIds = randomCards.map((c) => c.id);
    cardIds = [...cardIds, ...randomIds];
  }

  const cards = await prisma.card.findMany({
    where: {
      id: { in: cardIds },
    },
    include: {
      images: true,
      discount: true,
      categories: {
        include: { category: true },
      },
    },
  });

  return cards.sort((a, b) => {
    const qtyA = topSellers.find((item) => item.cardId === a.id)?._sum.quantity || 0;
    const qtyB = topSellers.find((item) => item.cardId === b.id)?._sum.quantity || 0;

    if (qtyB !== qtyA) return qtyB - qtyA;

    return cardIds.indexOf(a.id) - cardIds.indexOf(b.id);
  });
};

export const deleteBatchCards = async (ids: string[]) => {
  if (!ids || ids.length === 0) {
    throw new Error("Select at least one card to delete");
  }

  const cardsWithImages = await prisma.card.findMany({
    where: {
      id: { in: ids },
    },
    include: {
      images: true,
    },
  });

  if (cardsWithImages.length === 0) {
    throw new Error("No cards found to delete");
  }

  const allImagePaths: string[] = [];
  cardsWithImages.forEach((card) => {
    card.images.forEach((img) => {
      if (img.path) {
        allImagePaths.push(img.path);
      }
    });
  });

  const deletedResult = await prisma.$transaction(async (tx) => {
    await tx.imageCard.deleteMany({
      where: { cardId: { in: ids } },
    });

    await tx.categoriesOnCards.deleteMany({
      where: { cardId: { in: ids } },
    });

    const batchDeleteResult = await tx.card.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return batchDeleteResult;
  });

  if (allImagePaths.length > 0) {
    Promise.all(allImagePaths.map((path) => deleteFile(path).catch((err) => console.error(`Failed to delete physical file at path: ${path}`, err))));
  }

  await createNotificationByCode({
    notificationCode: "PRODUCT_NOTIF",
    title: "Batch Produk Dihapus",
    message: `${deletedResult.count} product successfully deleted from the system at once`,
    type: NotificationType.SYSTEM,
    url: "",
    metadata: { deletedIds: ids },
  });

  return deletedResult;
};
