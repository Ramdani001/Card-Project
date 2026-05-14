/* eslint-disable no-console */
import { logError } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { CityApiResponse, CreateCityParams, UpdateCityParams } from "@/types/params/cityParams";

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

export const syncCitiesFromApi = async () => {
  try {
    const provinces = await prisma.province.findMany({
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    let totalSynced = 0;

    for (const province of provinces) {
      console.log(`Syncing cities for ${province.name}...`);

      const response = await fetch(`https://wilayah.id/api/regencies/${province.code}.json`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        console.log(`Failed fetch province ${province.name}`);
        continue;
      }

      const result: CityApiResponse = await response.json();

      if (!Array.isArray(result.data)) {
        continue;
      }

      for (const city of result.data) {
        let existing = await prisma.city.findUnique({
          where: {
            code: city.code,
          },
        });

        if (!existing) {
          existing = await prisma.city.findFirst({
            where: {
              name: city.name,
              provinceId: province.id,
            },
          });
        }

        if (existing) {
          await prisma.city.update({
            where: {
              id: existing.id,
            },
            data: {
              code: city.code,
              name: city.name,
              provinceId: province.id,
            },
          });
        } else {
          await prisma.city.create({
            data: {
              code: city.code,
              name: city.name,
              provinceId: province.id,
            },
          });
        }

        totalSynced++;
      }
    }

    return {
      success: true,
      total: totalSynced,
    };
  } catch (error) {
    logError("CityService.syncCitiesFromApi", error);
    throw error;
  }
};
