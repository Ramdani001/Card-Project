import { logError } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { CreateCourierParams, UpdateCourierParams } from "@/types/params/courierParams";

export const getCouriers = async (options: Prisma.CourierFindManyArgs) => {
  const finalOptions: Prisma.CourierFindManyArgs = {
    ...options,
    where: {
      ...options.where,
      isActive: true,
    },
    orderBy: options.orderBy || { courierCode: "asc" },
  };

  const [couriers, total] = await Promise.all([prisma.courier.findMany(finalOptions), prisma.courier.count({ where: finalOptions.where })]);

  return { couriers, total };
};

export const getCourierById = async (id: string) => {
  return await prisma.courier.findUnique({
    where: { id },
  });
};

export const getCouriersActive = async () => {
  return await prisma.courier.findMany({
    where: {
      status: true,
      isActive: true,
    },
  });
};

export const createCourier = async (params: CreateCourierParams) => {
  try {
    return await prisma.courier.create({
      data: {
        courierCode: params.courierCode,
        ...(params.description && { description: params.description }),
        status: params.status,
        isActive: true,
      },
    });
  } catch (error) {
    logError("CourierService.createCourier", error);
    throw error;
  }
};

export const updateCourier = async (params: UpdateCourierParams) => {
  const existingCourier = await prisma.courier.findUnique({
    where: { id: params.id },
  });

  if (!existingCourier) {
    throw new Error("Courier not found");
  }

  try {
    const updated = await prisma.courier.update({
      where: { id: params.id },
      data: {
        ...(params.courierCode && { courierCode: params.courierCode }),
        ...(params.description && { description: params.description }),
        status: params.status,
        isActive: true,
      },
    });

    return updated;
  } catch (error) {
    logError("CourierService.updateCourier", error);
    throw error;
  }
};

export const deleteCourier = async (id: string) => {
  const courier = await prisma.courier.findUnique({
    where: { id },
  });

  if (!courier) {
    throw new Error("Courier not found");
  }

  const deletedCourier = await prisma.courier.update({
    where: { id },
    data: { isActive: false },
  });

  return deletedCourier;
};
