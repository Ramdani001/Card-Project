import prisma from "@/lib/prisma";
import { DiscountType, Prisma } from "@/prisma/generated/prisma/client";

interface CreateDiscountParams {
  name: string;
  value: number;
  type: DiscountType;
  startDate?: string | Date;
  endDate?: string | Date;
}

interface UpdateDiscountParams {
  id: string;
  name?: string;
  value?: number;
  type?: DiscountType;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  isActive?: boolean;
}

export const getDiscounts = async (options: Prisma.DiscountFindManyArgs) => {
  const finalOptions: Prisma.DiscountFindManyArgs = {
    ...options,
    where: {
      ...options.where,
      isActive: true,
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
  const { name, value, type, startDate, endDate } = params;

  if (value < 0) throw new Error("Discount value cannot be negative");
  if (type === "PERCENTAGE" && value > 100) throw new Error("Percentage discount cannot exceed 100%");

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start && end && start > end) {
    throw new Error("Start date must be before end date");
  }

  return await prisma.discount.create({
    data: {
      name,
      value: new Prisma.Decimal(value),
      type,
      startDate: start,
      endDate: end,
    },
  });
};

export const updateDiscount = async (params: UpdateDiscountParams) => {
  const { id, name, value, type, startDate, endDate, isActive } = params;

  const existing = await prisma.discount.findUnique({ where: { id } });
  if (!existing) throw new Error("Discount not found");

  if (value !== undefined) {
    if (value < 0) throw new Error("Discount value cannot be negative");
    const checkType = type || existing.type;
    if (checkType === "PERCENTAGE" && value > 100) throw new Error("Percentage discount cannot exceed 100%");
  }

  const newStart = startDate ? new Date(startDate) : startDate === null ? null : existing.startDate;
  const newEnd = endDate ? new Date(endDate) : endDate === null ? null : existing.endDate;

  if (newStart && newEnd && newStart > newEnd) {
    throw new Error("Start date must be before end date");
  }

  return await prisma.discount.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(value !== undefined && { value: new Prisma.Decimal(value) }),
      ...(type && { type }),
      startDate: newStart,
      endDate: newEnd,
      ...(isActive !== undefined && { isActive }),
    },
  });
};

export const deleteDiscount = async (id: string) => {
  const existing = await prisma.discount.findUnique({ where: { id } });
  if (!existing) throw new Error("Discount not found");

  return await prisma.discount.update({
    where: { id },
    data: { isActive: false },
  });
};
