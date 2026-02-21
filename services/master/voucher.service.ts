import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { DiscountType } from "@/prisma/generated/prisma/enums";

interface CreateVoucherParams {
  code: string;
  name: string;
  description?: string;
  type: DiscountType;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  stock?: number;
  startDate: Date | string;
  endDate: Date | string;
}

interface UpdateVoucherParams {
  id: string;
  code?: string;
  name?: string;
  description?: string;
  type?: DiscountType;
  value?: number;
  minPurchase?: number;
  maxDiscount?: number;
  stock?: number;
  startDate?: Date | string;
  endDate?: Date | string;
}

export const getVouchers = async (options: Prisma.VoucherFindManyArgs) => {
  const finalOptions: Prisma.VoucherFindManyArgs = {
    ...options,
    where: {
      ...options.where,
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
    },
  });
};

export const getVoucherByCode = async (code: string) => {
  return await prisma.voucher.findUnique({
    where: { code },
  });
};

export const createVoucher = async (params: CreateVoucherParams) => {
  const { code, name, description, type, value, minPurchase, maxDiscount, stock, startDate, endDate } = params;

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
      value: new Prisma.Decimal(value),
      minPurchase: minPurchase ? new Prisma.Decimal(minPurchase) : undefined,
      maxDiscount: maxDiscount ? new Prisma.Decimal(maxDiscount) : undefined,
      stock,
      startDate: start,
      endDate: end,
    },
  });
};

export const updateVoucher = async (params: UpdateVoucherParams) => {
  const { id, code, name, description, type, value, minPurchase, maxDiscount, stock, startDate, endDate } = params;

  const existing = await prisma.voucher.findUnique({ where: { id } });
  if (!existing) throw new Error("Voucher not found");

  if (code && code !== existing.code) {
    const duplicate = await getVoucherByCode(code);
    if (duplicate) throw new Error(`Voucher code '${code}' already exists`);
  }

  if (value !== undefined) {
    if (value < 0) throw new Error("Voucher value cannot be negative");
    const checkType = type || existing.type;
    if (checkType === "PERCENTAGE" && value > 100) throw new Error("Percentage discount cannot exceed 100%");
  }

  const finalStart = startDate ? new Date(startDate) : existing.startDate;
  const finalEnd = endDate ? new Date(endDate) : existing.endDate;
  if (finalEnd < finalStart) throw new Error("End date must be after start date");

  return await prisma.voucher.update({
    where: { id },
    data: {
      ...(code && { code }),
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(type && { type }),
      ...(value !== undefined && { value: new Prisma.Decimal(value) }),
      ...(minPurchase !== undefined && { minPurchase: minPurchase ? new Prisma.Decimal(minPurchase) : null }),
      ...(maxDiscount !== undefined && { maxDiscount: maxDiscount ? new Prisma.Decimal(maxDiscount) : null }),
      ...(stock !== undefined && { stock }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
    },
  });
};

export const deleteVoucher = async (id: string) => {
  const existing = await prisma.voucher.findUnique({ where: { id } });
  if (!existing) throw new Error("Voucher not found");

  return await prisma.voucher.delete({
    where: { id },
  });
};
