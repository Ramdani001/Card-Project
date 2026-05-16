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
      select: { id: true, code: true },
    });

    const cityMap = new Map<string, string>(cities.map((p) => [p.code, p.id]));

    const apiKey = process.env.API_KEY_APICOID || "";

    let totalSynced = 0;
    let page = 1;
    let hasMoreData = true;

    while (hasMoreData) {
      console.log(`Fetching sub district data for page ${page}...`);

      const response = await fetch(`https://use.api.co.id/regional/indonesia/districts?page=${page}`, {
        method: "GET",
        cache: "no-store",
        headers: { "X-API-CO-ID": apiKey },
      });

      if (!response.ok) {
        console.error(`Failed to fetch city on page ${page}`);
        break;
      }

      const result: SubDistrictApiResponse = await response.json();

      if (!result || !Array.isArray(result.data) || result.data.length === 0) {
        console.log(`No more data found. Stopping fetch at page ${page}.`);
        hasMoreData = false;
        break;
      }

      const pageQueries = [];

      for (const subDistrict of result.data) {
        const cityId = cityMap.get(subDistrict.regency_code);

        if (!cityId) {
          console.warn(`City code ${subDistrict.regency_code} not found for sub district ${subDistrict.name}. Skipping.`);
          continue;
        }

        pageQueries.push(
          prisma.subDistrict.upsert({
            where: { code: subDistrict.code },
            update: {
              name: subDistrict.name,
              cityId: cityId,
            },
            create: {
              code: subDistrict.code,
              name: subDistrict.name,
              cityId: cityId,
            },
          })
        );

        totalSynced++;
      }

      if (pageQueries.length > 0) {
        console.log(`Saving ${pageQueries.length} sub districts from page ${page} to database...`);
        await prisma.$transaction(pageQueries);
      }

      page++;
    }

    return {
      success: true,
      total: totalSynced,
      totalPagesSynced: page - 1,
    };
  } catch (error) {
    logError("SubDistrictService.syncSubDistrictsFromApi", error);
    throw error;
  }
};
