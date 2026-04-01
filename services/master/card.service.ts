import { deleteFile, saveFile } from "@/helpers/file.helper";
import prisma from "@/lib/prisma";
import { NotificationType, Prisma } from "@/prisma/generated/prisma/client";
import { generateSlug } from "@/utils";
import ExcelJS from "exceljs";
import { createNotificationByCode } from "../transaction/notification.service";
import { CONSTANT } from "@/constants";

interface CreateCardParams {
  name: string;
  price: number;
  stock: number;
  categoryIds: string[];
  discountId?: string | null;
  description?: string;
  minQtyPurchase?: number | null;
  maxQtyPurchase?: number | null;
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
  minQtyPurchase?: number | null;
  maxQtyPurchase?: number | null;
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
  const { name, price, stock, categoryIds, discountId, description, sku, file, maxQtyPurchase, minQtyPurchase } = params;

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
          maxQtyPurchase,
          minQtyPurchase,
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
    if (uploadedFileUrl) {
      await deleteFile(uploadedFileUrl).catch((err) => console.error("Gagal cleanup file Supabase setelah error DB:", err));
    }
    throw error;
  }
};

export const updateCard = async (params: UpdateCardParams) => {
  const { id, name, price, stock, categoryIds, discountId, description, sku, file, userId, maxQtyPurchase, minQtyPurchase } = params;

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

  const imageMap: Record<number, { buffer: Buffer; extension: string }> = {};
  worksheet.getImages().forEach((imgRef) => {
    const img = workbook.getImage(Number(imgRef.imageId));
    const rowNumber = Math.floor(imgRef.range.tl.row) + 1;
    imageMap[rowNumber] = {
      buffer: Buffer.from(img.buffer as ArrayBuffer),
      extension: img.extension,
    };
  });

  const allCategories = await prisma.category.findMany();
  const tempUploadedFiles: string[] = [];

  try {
    return await prisma.$transaction(
      async (tx) => {
        let successCount = 0;
        let updatedCount = 0;

        for (let i = 2; i <= worksheet.rowCount; i++) {
          const row = worksheet.getRow(i);
          const name = row.getCell(1).value?.toString();
          const priceRaw = row.getCell(2).value;
          const stockRaw = row.getCell(3).value;
          const sku = row.getCell(4).value?.toString();
          const categoryName = row.getCell(5).value?.toString();
          const description = row.getCell(6).value?.toString();

          if (!name && !priceRaw) continue;
          if (!name || priceRaw === null) throw new Error(`Baris ${i}: Nama & Harga wajib.`);

          const slug = generateSlug(name);
          const category = allCategories.find((c) => c.name.toLowerCase() === categoryName?.toLowerCase());

          let newImageData: any = null;
          if (imageMap[i]) {
            const { buffer, extension } = imageMap[i];
            const fileMock = new File([buffer as BlobPart], `import_${slug}.${extension}`, { type: `image/${extension}` });
            newImageData = await saveFile(fileMock);
            tempUploadedFiles.push(newImageData.path);
          }

          const existingCard = await tx.card.findFirst({
            where: { OR: [{ sku: sku || undefined }, { slug }] },
            include: { images: true },
          });

          const commonData = {
            name,
            price: new Prisma.Decimal(Number(priceRaw)),
            stock: Number(stockRaw) || 0,
            description,
            sku,
          };

          if (existingCard) {
            await tx.card.update({
              where: { id: existingCard.id },
              data: {
                ...commonData,
                categories: category ? { deleteMany: {}, create: { categoryId: category.id } } : undefined,
                images: newImageData ? { deleteMany: {}, create: { ...newImageData, isPrimary: true } } : undefined,
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
                categories: category ? { create: { categoryId: category.id } } : undefined,
                images: newImageData ? { create: { ...newImageData, isPrimary: true } } : undefined,
              },
            });
            successCount++;
          }
        }

        await createNotificationByCode({
          notificationCode: "PRODUCT_NOTIF",
          title: "Import Produk",
          message: `${successCount} baru, ${updatedCount} diperbarui.`,
          type: NotificationType.SYSTEM,
          url: "",
        });

        return { success: true, message: `Berhasil import ${successCount} data.` };
      },
      { timeout: 60000 }
    );
  } catch (error) {
    for (const path of tempUploadedFiles) await deleteFile(path).catch(console.error);
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
    { header: "Image", key: "image", width: 25 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const currentRow = i + 2;

    const row = worksheet.addRow({
      name: card.name,
      sku: card.sku || "-",
      price: Number(card.price),
      stock: card.stock,
      categories: card.categories.map((c) => c.category.name).join(", "),
      description: card.description,
    });

    row.height = 75;
    row.alignment = { vertical: "middle", horizontal: "left", wrapText: true };

    const primaryImg = card.images.find((img) => img.isPrimary) || card.images[0];

    if (primaryImg && primaryImg.path) {
      try {
        const response = await fetch(`/uploads/${primaryImg.path}`);
        if (!response.ok) throw new Error("Fetch failed");

        // const arrayBuffer = await response.arrayBuffer();

        let extension = primaryImg.path.split(".").pop()?.toLowerCase() || "png";
        if (!["jpeg", "png", "gif"].includes(extension)) {
          extension = "png";
        }

        // const imageId = workbook.addImage({
        //   buffer: Buffer.from(arrayBuffer),
        //   extension: extension as any,
        // });

        // worksheet.addImage(imageId, {
        //   tl: { col: 6, row: i + 1 },
        //   ext: { width: 100, height: 100 },
        //   editAs: "oneCell",
        // });
      } catch (error) {
        console.error(`Gagal sematkan gambar untuk ${card.name}:`, error);
        worksheet.getCell(`G${currentRow}`).value = "Gagal memuat gambar";
      }
    }
  }

  worksheet.getColumn("price").numFmt = "#,##0";

  return await workbook.xlsx.writeBuffer();
};

export const generateCardTemplate = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Template Import");
  const categories = await prisma.category.findMany({ select: { name: true } });

  worksheet.columns = [
    { header: "Card Name*", key: "name", width: 30 },
    { header: "Price*", key: "price", width: 15 },
    { header: "Stock", key: "stock", width: 10 },
    { header: "SKU", key: "sku", width: 20 },
    { header: "Category", key: "category", width: 20 },
    { header: "Description", key: "description", width: 30 },
    { header: "Image", key: "image", width: 25 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "E67E22" } };

  // Dropdown kategori
  if (categories.length > 0) {
    const list = `"${categories.map((c) => c.name).join(",")}"`;
    for (let i = 2; i <= 50; i++) {
      worksheet.getCell(`E${i}`).dataValidation = { type: "list", formulae: [list] };
    }
  }

  return await workbook.xlsx.writeBuffer();
};
