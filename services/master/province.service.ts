import { logError } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { CreateProvinceParams, ProvinceApiResponse, UpdateProvinceParams } from "@/types/params/provinceParams";

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

  if (!countryId) throw new Error("Country cannot empty.");

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

  if (!countryId) throw new Error("Country cannot empty.");

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

export const syncProvincesFromApi = async () => {
  try {
    const country = await prisma.country.findFirst({
      where: {
        name: {
          equals: "Indonesia",
          mode: "insensitive",
        },
      },
    });

    if (!country) {
      throw new Error("Master country Indonesia not found.");
    }

    const response = await fetch("https://wilayah.id/api/provinces.json", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch provinces: ${response.status}`);
    }

    const result: ProvinceApiResponse = await response.json();

    if (!Array.isArray(result.data)) {
      throw new Error("Invalid provinces response.");
    }

    const synced = await Promise.all(
      result.data.map((province) =>
        prisma.province.upsert({
          where: {
            code: province.code,
          },
          update: {
            name: province.name,
            countryId: country.id,
          },
          create: {
            code: province.code,
            name: province.name,
            countryId: country.id,
          },
        })
      )
    );

    return {
      success: true,
      total: synced.length,
      updatedAt: result.meta.updated_at,
      data: synced,
    };
  } catch (error) {
    logError("ProvinceService.syncProvincesFromApi", error);
    throw error;
  }
};
