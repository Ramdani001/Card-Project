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
      select: { id: true, code: true },
    });

    const provinceMap = new Map<string, string>(provinces.map((p) => [p.code, p.id]));

    const apiKey = process.env.API_KEY_APICOID || "";

    let totalSynced = 0;
    let page = 1;
    let hasMoreData = true;

    while (hasMoreData) {
      console.log(`Fetching city data for page ${page}...`);

      const response = await fetch(`https://use.api.co.id/regional/indonesia/regencies?page=${page}`, {
        method: "GET",
        cache: "no-store",
        headers: { "X-API-CO-ID": apiKey },
      });

      if (!response.ok) {
        console.error(`Failed to fetch city on page ${page}`);
        break;
      }

      const result: CityApiResponse = await response.json();

      if (!result || !Array.isArray(result.data) || result.data.length === 0) {
        console.log(`No more data found. Stopping fetch at page ${page}.`);
        hasMoreData = false;
        break;
      }

      const pageQueries = [];

      for (const city of result.data) {
        const provinceId = provinceMap.get(city.province_code);

        if (!provinceId) {
          console.warn(`Province code ${city.province_code} not found for city ${city.name}. Skipping.`);
          continue;
        }

        pageQueries.push(
          prisma.city.upsert({
            where: { code: city.code },
            update: {
              name: city.name,
              provinceId: provinceId,
            },
            create: {
              code: city.code,
              name: city.name,
              provinceId: provinceId,
            },
          })
        );

        totalSynced++;
      }

      if (pageQueries.length > 0) {
        console.log(`Saving ${pageQueries.length} cities from page ${page} to database...`);
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
    logError("CityService.syncCitiesFromApi", error);
    throw error;
  }
};
