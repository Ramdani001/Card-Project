import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { CartItemDto } from "@/types/dtos/CartItemDto";
import { CreateVoucherParams, UpdateVoucherParams } from "@/types/params/voucherParams";
import { getCardPrice } from "@/utils";

export const getVouchers = async (options: Prisma.VoucherFindManyArgs) => {
  const finalOptions: Prisma.VoucherFindManyArgs = {
    ...options,
    where: {
      ...options.where,
      isActive: true,
    },
    include: {
      voucherCardCategories: {
        include: {
          cardCategory: true,
        },
      },
      voucherCards: {
        include: {
          card: true,
        },
      },
      voucherRoles: {
        include: {
          role: true,
        },
      },
    },
    orderBy: options.orderBy || { createdAt: "desc" },
  };

  const [vouchers, total] = await Promise.all([prisma.voucher.findMany(finalOptions), prisma.voucher.count({ where: finalOptions.where })]);

  return { vouchers, total };
};

export const getVoucherById = async (id: string) => {
  return await prisma.voucher.findUnique({
    where: { id },
    include: {
      _count: { select: { transactions: true } },
      voucherCardCategories: true,
      voucherCards: true,
      voucherRoles: true,
    },
  });
};

export const getVoucherByCode = async (code: string) => {
  return await prisma.voucher.findFirst({
    where: { code, isActive: true },
  });
};

export const createVoucher = async (params: CreateVoucherParams) => {
  const {
    code,
    name,
    description,
    type,
    usageCategory,
    value,
    minPurchase,
    maxDiscount,
    stock,
    startDate,
    endDate,
    voucherCardCategories,
    voucherCards,
    voucherRoles,
  } = params;

  if (value < 0) throw new Error("Voucher value cannot be negative");
  if (type === "PERCENTAGE" && value > 100) throw new Error("Percentage discount cannot exceed 100%");

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end < start) throw new Error("End date must be after start date");

  const existingCode = await getVoucherByCode(code);
  if (existingCode) throw new Error(`Voucher code '${code}' already exists`);

  return await prisma.voucher.create({
    data: {
      code,
      name,
      description,
      type,
      usageCategory,
      value: new Prisma.Decimal(value),
      minPurchase: minPurchase ? new Prisma.Decimal(minPurchase) : undefined,
      maxDiscount: maxDiscount ? new Prisma.Decimal(maxDiscount) : undefined,
      stock,
      startDate: start,
      endDate: end,
      voucherCardCategories: {
        create: voucherCardCategories,
      },
      voucherCards: {
        create: voucherCards,
      },
      voucherRoles: {
        create: voucherRoles,
      },
    },
  });
};

export const updateVoucher = async (params: UpdateVoucherParams) => {
  const {
    id,
    code,
    name,
    description,
    type,
    usageCategory,
    value,
    minPurchase,
    maxDiscount,
    stock,
    startDate,
    endDate,
    voucherCardCategories,
    voucherCards,
    voucherRoles,
  } = params;

  const existing = await prisma.voucher.findUnique({
    where: { id },
    include: {
      voucherRoles: true,
    },
  });
  if (!existing) throw new Error("Voucher not found");

  if (code && code !== existing.code) {
    const duplicate = await getVoucherByCode(code);
    if (duplicate) throw new Error(`Voucher code '${code}' already exists`);
  }

  const finalValue = value !== undefined ? value : Number(existing.value);
  const finalType = type || existing.type;

  if (finalValue < 0) throw new Error("Voucher value cannot be negative");
  if (finalType === "PERCENTAGE" && finalValue > 100) throw new Error("Percentage discount cannot exceed 100%");

  const finalStart = startDate ? new Date(startDate) : existing.startDate;
  const finalEnd = endDate ? new Date(endDate) : existing.endDate;
  if (finalEnd < finalStart) throw new Error("End date must be after start date");

  await prisma.voucher.deleteMany({
    where: {
      isActive: false,
      code,
    },
  });

  return await prisma.voucher.update({
    where: { id },
    data: {
      code,
      name,
      description,
      type,
      usageCategory,
      value: value !== undefined ? new Prisma.Decimal(value) : undefined,
      minPurchase: minPurchase !== undefined ? (minPurchase ? new Prisma.Decimal(minPurchase) : null) : undefined,
      maxDiscount: maxDiscount !== undefined ? (maxDiscount ? new Prisma.Decimal(maxDiscount) : null) : undefined,
      stock,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,

      ...(voucherRoles && {
        voucherRoles: {
          deleteMany: {},
          create: voucherRoles,
        },
      }),
      ...(voucherCards && {
        voucherCards: {
          deleteMany: {},
          create: voucherCards,
        },
      }),
      ...(voucherCardCategories && {
        voucherCardCategories: {
          deleteMany: {},
          create: voucherCardCategories,
        },
      }),
    },
  });
};

export const deleteVoucher = async (id: string) => {
  const existing = await prisma.voucher.findUnique({ where: { id } });
  if (!existing) throw new Error("Voucher not found");

  return await prisma.voucher.update({
    where: { id },
    data: { isActive: false },
  });
};

export const validateVoucherForCheckout = async (code: string, cartItems: CartItemDto[], userId: string) => {
  const voucher = await prisma.voucher.findFirst({
    where: {
      code,
      isActive: true,
    },
    include: {
      voucherRoles: true,
      voucherCards: true,
      voucherCardCategories: true,
    },
  });

  if (!voucher) {
    return { success: false, message: "Invalid Voucher Code." };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return { success: false, message: "User not found." };
  }

  const now = new Date();
  const subtotal = cartItems.reduce((acc, item) => acc + getCardPrice(item) * item.quantity, 0);

  if (now < voucher.startDate || now > voucher.endDate) {
    return { success: false, message: "Voucher is not active." };
  }

  if (voucher.stock !== null && voucher.usedCount >= voucher.stock) {
    return { success: false, message: "Voucher out of stock." };
  }

  if (voucher.minPurchase && subtotal < Number(voucher.minPurchase)) {
    return { success: false, message: `Min purchase Rp ${Number(voucher.minPurchase).toLocaleString()}` };
  }

  if (voucher.voucherRoles.length > 0) {
    const allowed = voucher.voucherRoles.some((r) => r.roleId === user.roleId);
    if (!allowed) {
      return { success: false, message: "Voucher not allowed for your role." };
    }
  }

  const hasProductLimit = voucher.voucherCards.length > 0;
  const hasCategoryLimit = voucher.voucherCardCategories.length > 0;

  if (hasProductLimit || hasCategoryLimit) {
    const cartCardIds = cartItems.map((item) => item.cardId);
    const cartCategoryIds = cartItems.flatMap((item) => item.card?.categories?.map((category) => category.category.id) || []);
    const allowedByProduct = voucher.voucherCards.some((v) => cartCardIds.includes(v.cardId));
    const allowedByCategory = voucher.voucherCardCategories.some((v) => cartCategoryIds.includes(v.cardCategoryId));

    if (!allowedByProduct && !allowedByCategory) {
      return { success: false, message: "Voucher not applicable to cart items." };
    }
  }

  let discountAmount = 0;
  const voucherValue = Number(voucher.value);

  if (voucher.type === "PERCENTAGE") {
    discountAmount = subtotal * (voucherValue / 100);

    if (voucher.maxDiscount) {
      const maxDiscountAmount = Number(voucher.maxDiscount);
      if (discountAmount > maxDiscountAmount) {
        discountAmount = maxDiscountAmount;
      }
    }
  } else if (voucher.type === "NOMINAL") {
    discountAmount = voucherValue;
  }

  if (discountAmount > subtotal) {
    discountAmount = subtotal;
  }

  return {
    success: true,
    message: "Voucher successfully applied.",
    data: {
      discountAmount,
      code: voucher.code,
    },
  };
};
