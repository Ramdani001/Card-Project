import prisma from "@/lib/prisma";
import { DiscountType, Prisma } from "@/prisma/generated/prisma/client";

interface CreateDiscountParams {
  name: string;
  value: number;
  type: DiscountType;
}

interface UpdateDiscountParams {
  id: string;
  name?: string;
  value?: number;
  type?: DiscountType;
}

export const getDiscounts = async (options: Prisma.DiscountFindManyArgs) => {
  const finalOptions: Prisma.DiscountFindManyArgs = {
    ...options,
    where: {
      ...options.where,
    },
    orderBy: options.orderBy || { createdAt: "desc" },
  };

  const [discounts, total] = await Promise.all([prisma.discount.findMany(finalOptions), prisma.discount.count({ where: finalOptions.where })]);

  return { discounts, total };
};

export const getDiscountById = async (id: string) => {
  return await prisma.discount.findUnique({
    where: { id },
    include: {
      _count: { select: { cards: true } },
    },
  });
};

export const createDiscount = async (params: CreateDiscountParams) => {
  const { name, value, type } = params;

  if (value < 0) throw new Error("Discount value cannot be negative");
  if (type === "PERCENTAGE" && value > 100) throw new Error("Percentage discount cannot exceed 100%");

  return await prisma.discount.create({
    data: {
      name,
      value: new Prisma.Decimal(value),
      type,
    },
  });
};

export const updateDiscount = async (params: UpdateDiscountParams) => {
  const { id, name, value, type } = params;

  const existing = await prisma.discount.findUnique({ where: { id } });
  if (!existing) throw new Error("Discount not found");

  if (value !== undefined) {
    if (value < 0) throw new Error("Discount value cannot be negative");
    const checkType = type || existing.type;
    if (checkType === "PERCENTAGE" && value > 100) throw new Error("Percentage discount cannot exceed 100%");
  }

  return await prisma.discount.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(value !== undefined && { value: new Prisma.Decimal(value) }),
      ...(type && { type }),
    },
  });
};

export const deleteDiscount = async (id: string) => {
  const existing = await prisma.discount.findUnique({ where: { id } });
  if (!existing) throw new Error("Discount not found");

  return await prisma.discount.delete({
    where: { id },
  });
};
