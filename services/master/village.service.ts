/* eslint-disable no-console */
import { logError } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { CreateVillageParams, UpdateVillageParams, VillageApiResponse } from "@/types/params/villageParams";

export const getVillages = async (options: Prisma.VillageFindManyArgs) => {
  const finalOptions: Prisma.VillageFindManyArgs = {
    ...options,
    where: {
      ...options.where,
    },
    orderBy: options.orderBy || { name: "asc" },
    include: { subDistrict: true },
  };

  const [villages, total] = await Promise.all([prisma.village.findMany(finalOptions), prisma.village.count({ where: finalOptions.where })]);

  return { villages, total };
};

export const getVillageById = async (id: string) => {
  return await prisma.village.findUnique({
    where: { id },
    include: { subDistrict: true },
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

export const syncVillagesFromApi = async () => {
  try {
    const subDistricts = await prisma.subDistrict.findMany({
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    let totalSynced = 0;

    for (const subDistrict of subDistricts) {
      console.log(`Syncing villages for ${subDistrict.name}...`);

      const response = await fetch(`https://wilayah.id/api/villages/${subDistrict.code}.json`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        console.log(`Failed fetch sub district ${subDistrict.name}`);
        continue;
      }

      const result: VillageApiResponse = await response.json();

      if (!Array.isArray(result.data)) {
        continue;
      }

      for (const village of result.data) {
        let existing = await prisma.village.findUnique({
          where: {
            code: village.code,
          },
        });

        if (!existing) {
          existing = await prisma.village.findFirst({
            where: {
              name: village.name,
              subDistrictId: subDistrict.id,
            },
          });
        }

        if (existing) {
          await prisma.village.update({
            where: {
              id: existing.id,
            },
            data: {
              code: village.code,
              name: village.name,
              subDistrictId: subDistrict.id,
            },
          });
        } else {
          await prisma.village.create({
            data: {
              code: village.code,
              name: village.name,
              subDistrictId: subDistrict.id,
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
    logError("VillageService.syncVillagesFromApi", error);
    throw error;
  }
};
