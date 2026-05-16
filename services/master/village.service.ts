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
    const subDistrictCache = new Map<string, string>();
    const apiKey = process.env.API_KEY_APICOID || "";

    let totalSynced = 0;
    let page = 1;
    let hasMoreData = true;

    while (hasMoreData) {
      console.log(`Fetching village data for page ${page}...`);

      const response = await fetch(`https://use.api.co.id/regional/indonesia/villages?page=${page}`, {
        method: "GET",
        cache: "no-store",
        headers: { "X-API-CO-ID": apiKey },
      });

      if (!response.ok) {
        console.error(`Failed to fetch village on page ${page}`);
        break;
      }

      const result: VillageApiResponse = await response.json();

      if (!result || !Array.isArray(result.data) || result.data.length === 0) {
        console.log(`No more data found. Stopping fetch at page ${page}.`);
        hasMoreData = false;
        break;
      }

      const pageQueries = [];

      for (const village of result.data) {
        let subDistrictId = subDistrictCache.get(village.district_code);

        if (!subDistrictId) {
          const subDistrict = await prisma.subDistrict.findUnique({
            where: { code: village.district_code },
            select: { id: true },
          });

          if (subDistrict) {
            subDistrictId = subDistrict.id;
            subDistrictCache.set(village.district_code, subDistrict.id);
          }
        }

        if (!subDistrictId) {
          console.warn(`Sub District code ${village.district_code} not found for village ${village.name}. Skipping.`);
          continue;
        }

        pageQueries.push(
          prisma.village.upsert({
            where: {
              code: village.code,
            },
            update: {
              code: village.code,
              name: village.name,
              subDistrictId: subDistrictId,
            },
            create: {
              code: village.code,
              name: village.name,
              subDistrictId: subDistrictId,
            },
          })
        );

        totalSynced++;
      }

      if (pageQueries.length > 0) {
        console.log(`Saving ${pageQueries.length} villages from page ${page} to database...`);
        try {
          await prisma.$transaction(pageQueries);
        } catch (txError: any) {
          if (txError.code === "P2002") {
            console.warn(`[Warning] Found unique constraint duplicate on page ${page}. Resolving row by row...`);
            for (const q of pageQueries) {
              try {
                await q;
              } catch (rowError) {
                console.error(`Skipping row due to data conflict:`, rowError);
              }
            }
          } else {
            throw txError;
          }
        }
      }

      page++;
    }

    return {
      success: true,
      total: totalSynced,
      totalPagesSynced: page - 1,
    };
  } catch (error) {
    logError("VillageService.syncVillagesFromApi", error);
    throw error;
  }
};
