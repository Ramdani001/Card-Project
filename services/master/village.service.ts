import { logError } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { CreateVillageParams, UpdateVillageParams } from "@/types/params/villageParams";

export const getVillages = async (options: Prisma.VillageFindManyArgs) => {
  const finalOptions: Prisma.VillageFindManyArgs = {
    ...options,
    where: {
      ...options.where,
    },
    orderBy: options.orderBy || { name: "asc" },
  };

  const [villages, total] = await Promise.all([prisma.village.findMany(finalOptions), prisma.village.count({ where: finalOptions.where })]);

  return { villages, total };
};

export const getVillageById = async (id: string) => {
  return await prisma.village.findUnique({
    where: { id },
  });
};

export const createVillage = async (params: CreateVillageParams) => {
  const { name, code, subDistrictId } = params;

  try {
    return await prisma.village.create({
      data: {
        name,
        code,
        subDistrictId,
      },
    });
  } catch (error) {
    logError("VillageService.createVillage", error);
    throw error;
  }
};

export const updateVillage = async (id: string, params: UpdateVillageParams) => {
  const { name, code, subDistrictId } = params;

  const existingVillage = await prisma.village.findUnique({
    where: { id },
  });

  if (!existingVillage) throw new Error("Village not found");

  try {
    const updated = await prisma.village.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(subDistrictId && { subDistrictId }),
      },
    });

    return updated;
  } catch (error) {
    logError("VillageService.updateVillage", error);
    throw error;
  }
};

export const deleteVillage = async (id: string) => {
  const village = await prisma.village.findUnique({
    where: { id },
  });

  if (!village) throw new Error("Village not found");

  const deletedVillage = await prisma.village.delete({
    where: { id },
  });

  return deletedVillage;
};
