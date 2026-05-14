import { logError } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { CreateSubDistrictParams, UpdateSubDistrictParams } from "@/types/params/subDistrictParams";

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
