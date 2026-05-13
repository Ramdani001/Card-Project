import { logError } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { CreateProvinceParams, UpdateProvinceParams } from "@/types/params/provinceParams";

export const getProvincies = async (options: Prisma.ProvinceFindManyArgs) => {
  const finalOptions: Prisma.ProvinceFindManyArgs = {
    ...options,
    where: {
      ...options.where,
    },
    orderBy: options.orderBy || { name: "asc" },
    include: {
      country: true,
    },
  };

  const [provincies, total] = await Promise.all([prisma.province.findMany(finalOptions), prisma.province.count({ where: finalOptions.where })]);

  return { provincies, total };
};

export const getProvinceById = async (id: string) => {
  return await prisma.province.findUnique({
    where: { id },
  });
};

export const createProvince = async (params: CreateProvinceParams) => {
  const { name, code, countryId } = params;

  try {
    return await prisma.province.create({
      data: {
        name,
        code,
        countryId,
      },
    });
  } catch (error) {
    logError("ProvinceService.createProvince", error);
    throw error;
  }
};

export const updateProvince = async (id: string, params: UpdateProvinceParams) => {
  const { name, code, countryId } = params;

  const existingProvince = await prisma.province.findUnique({
    where: { id },
  });

  if (!existingProvince) throw new Error("Province not found");

  try {
    const updated = await prisma.province.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(countryId && { countryId }),
      },
    });

    return updated;
  } catch (error) {
    logError("ProvinceService.updateProvince", error);
    throw error;
  }
};

export const deleteProvince = async (id: string) => {
  const province = await prisma.province.findUnique({
    where: { id },
  });

  if (!province) throw new Error("Province not found");

  const deletedProvince = await prisma.province.delete({
    where: { id },
  });

  return deletedProvince;
};
