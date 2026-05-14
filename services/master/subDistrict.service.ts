/* eslint-disable no-console */
import { logError } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { CreateSubDistrictParams, SubDistrictApiResponse, UpdateSubDistrictParams } from "@/types/params/subDistrictParams";

export const getSubDistricts = async (options: Prisma.SubDistrictFindManyArgs) => {
  const finalOptions: Prisma.SubDistrictFindManyArgs = {
    ...options,
    where: {
      ...options.where,
    },
    orderBy: options.orderBy || { name: "asc" },
    include: { city: true },
  };

  const [subDistricts, total] = await Promise.all([
    prisma.subDistrict.findMany(finalOptions),
    prisma.subDistrict.count({ where: finalOptions.where }),
  ]);

  return { subDistricts, total };
};

export const getSubDistrictById = async (id: string) => {
  return await prisma.subDistrict.findUnique({
    where: { id },
    include: { city: true },
  });
};

export const createSubDistrict = async (params: CreateSubDistrictParams) => {
  const { name, code, cityId } = params;

  if (!cityId) throw new Error("City cannot empty.");

  try {
    return await prisma.subDistrict.create({
      data: {
        name,
        code,
        cityId,
      },
    });
  } catch (error) {
    logError("SubDistrictService.createSubDistrict", error);
    throw error;
  }
};

export const updateSubDistrict = async (id: string, params: UpdateSubDistrictParams) => {
  const { name, code, cityId } = params;

  if (!cityId) throw new Error("City cannot empty.");

  const existingSubDistrict = await prisma.subDistrict.findUnique({
    where: { id },
  });

  if (!existingSubDistrict) throw new Error("SubDistrict not found");

  try {
    const updated = await prisma.subDistrict.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(cityId && { cityId }),
      },
    });

    return updated;
  } catch (error) {
    logError("SubDistrictService.updateSubDistrict", error);
    throw error;
  }
};

export const deleteSubDistrict = async (id: string) => {
  const subDistrict = await prisma.subDistrict.findUnique({
    where: { id },
  });

  if (!subDistrict) throw new Error("SubDistrict not found");

  const deletedSubDistrict = await prisma.subDistrict.delete({
    where: { id },
  });

  return deletedSubDistrict;
};

export const syncSubDistrictsFromApi = async () => {
  try {
    const cities = await prisma.city.findMany({
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    let totalSynced = 0;

    for (const city of cities) {
      console.log(`Syncing sub districts for ${city.name}...`);

      const response = await fetch(`https://wilayah.id/api/districts/${city.code}.json`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        console.log(`Failed fetch city ${city.name}`);
        continue;
      }

      const result: SubDistrictApiResponse = await response.json();

      if (!Array.isArray(result.data)) {
        continue;
      }

      for (const subDistrict of result.data) {
        let existing = await prisma.subDistrict.findUnique({
          where: {
            code: subDistrict.code,
          },
        });

        if (!existing) {
          existing = await prisma.subDistrict.findFirst({
            where: {
              name: subDistrict.name,
              cityId: city.id,
            },
          });
        }

        if (existing) {
          await prisma.subDistrict.update({
            where: {
              id: existing.id,
            },
            data: {
              code: subDistrict.code,
              name: subDistrict.name,
              cityId: city.id,
            },
          });
        } else {
          await prisma.subDistrict.create({
            data: {
              code: subDistrict.code,
              name: subDistrict.name,
              cityId: city.id,
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
    logError("SubDistrictService.syncSubDistrictsFromApi", error);
    throw error;
  }
};
