import { logError } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { CreateCityParams, UpdateCityParams } from "@/types/params/cityParams";

export const getCities = async (options: Prisma.CityFindManyArgs) => {
  const finalOptions: Prisma.CityFindManyArgs = {
    ...options,
    where: {
      ...options.where,
    },
    orderBy: options.orderBy || { name: "asc" },
    include: { province: true },
  };

  const [cities, total] = await Promise.all([prisma.city.findMany(finalOptions), prisma.city.count({ where: finalOptions.where })]);

  return { cities, total };
};

export const getCityById = async (id: string) => {
  return await prisma.city.findUnique({
    where: { id },
    include: { province: true },
  });
};

export const createCity = async (params: CreateCityParams) => {
  const { name, code, provinceId } = params;

  if (!provinceId) throw new Error("Province cannot empty.");

  try {
    return await prisma.city.create({
      data: {
        name,
        code,
        provinceId,
      },
    });
  } catch (error) {
    logError("CityService.createCity", error);
    throw error;
  }
};

export const updateCity = async (id: string, params: UpdateCityParams) => {
  const { name, code, provinceId } = params;

  if (!provinceId) throw new Error("Province cannot empty.");

  const existingCity = await prisma.city.findUnique({
    where: { id },
  });

  if (!existingCity) throw new Error("City not found");

  try {
    const updated = await prisma.city.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(provinceId && { provinceId }),
      },
    });

    return updated;
  } catch (error) {
    logError("CityService.updateCity", error);
    throw error;
  }
};

export const deleteCity = async (id: string) => {
  const city = await prisma.city.findUnique({
    where: { id },
  });

  if (!city) throw new Error("City not found");

  const deletedCity = await prisma.city.delete({
    where: { id },
  });

  return deletedCity;
};
