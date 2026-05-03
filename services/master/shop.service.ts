import { logError } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";

interface CreateShopParams {
  name: string;
  address: string;
}

interface UpdateShopParams {
  id: string;
  name?: string;
  address?: string;
}

export const getShops = async (options: Prisma.ShopFindManyArgs) => {
  const finalOptions: Prisma.ShopFindManyArgs = {
    ...options,
    where: {
      ...options.where,
    },
    orderBy: options.orderBy || { createdAt: "desc" },
  };

  const [shops, total] = await Promise.all([prisma.shop.findMany(finalOptions), prisma.shop.count({ where: finalOptions.where })]);

  return { shops, total };
};

export const getShopById = async (id: string) => {
  return await prisma.shop.findUnique({
    where: { id },
  });
};

export const createShop = async (params: CreateShopParams) => {
  const { name, address } = params;

  try {
    return await prisma.shop.create({
      data: {
        name,
        address,
      },
    });
  } catch (error) {
    logError("ShopService.createShop", error);
    throw error;
  }
};

export const updateShop = async (params: UpdateShopParams) => {
  const { id, name, address } = params;

  const existingShop = await prisma.shop.findUnique({
    where: { id },
  });

  if (!existingShop) {
    throw new Error("Shop not found");
  }

  try {
    const updated = await prisma.shop.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(address && { address }),
      },
    });

    return updated;
  } catch (error) {
    logError("ShopService.updateShop", error);
    throw error;
  }
};

export const deleteShop = async (id: string) => {
  const shop = await prisma.shop.findUnique({
    where: { id },
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  const deletedShop = await prisma.shop.delete({
    where: { id },
  });
  return deletedShop;
};
