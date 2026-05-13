import { logError } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";

export const getCountries = async (options: Prisma.CountryFindManyArgs) => {
  const finalOptions: Prisma.CountryFindManyArgs = {
    ...options,
    where: {
      ...options.where,
    },
    orderBy: options.orderBy || { name: "asc" },
  };

  const [countries, total] = await Promise.all([prisma.country.findMany(finalOptions), prisma.country.count({ where: finalOptions.where })]);

  return { countries, total };
};

export const getCountryById = async (id: string) => {
  return await prisma.country.findUnique({
    where: { id },
  });
};

export const createCountry = async (params: Prisma.CountryCreateInput) => {
  const { name, isoCode } = params;

  try {
    return await prisma.country.create({
      data: {
        name,
        isoCode,
      },
    });
  } catch (error) {
    logError("CountryService.createCountry", error);
    throw error;
  }
};

export const updateCountry = async (id: string, data: Prisma.CountryUpdateInput) => {
  const existing = await prisma.country.findUnique({ where: { id } });
  if (!existing) throw new Error("Country not found");

  try {
    return await prisma.country.update({
      where: { id },
      data,
    });
  } catch (error) {
    logError("CountryService.updateCountry", error);
    throw error;
  }
};

export const deleteCountry = async (id: string) => {
  const country = await prisma.country.findUnique({
    where: { id },
  });

  if (!country) throw new Error("Country not found");

  const deletedCountry = await prisma.country.delete({
    where: { id },
  });

  return deletedCountry;
};
