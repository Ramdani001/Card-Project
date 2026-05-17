import { logError } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { CreateShopParams, UpdateShopParams } from "@/types/params/shopParams";

export const getShops = async (options: Prisma.ShopFindManyArgs) => {
  const finalOptions: Prisma.ShopFindManyArgs = {
    ...options,
    where: {
      ...options.where,
    },
    orderBy: options.orderBy || { createdAt: "desc" },
    include: {
      country: true,
      province: true,
      subDistrict: true,
      village: true,
    },
  };

  const [shops, total] = await Promise.all([prisma.shop.findMany(finalOptions), prisma.shop.count({ where: finalOptions.where })]);

  return { shops, total };
};

export const getShopById = async (id: string) => {
  return await prisma.shop.findUnique({
    where: { id },
    include: {
      country: true,
      province: true,
      subDistrict: true,
      village: true,
    },
  });
};

export const createShop = async (params: CreateShopParams) => {
  const { name, address, countryIsoCode, provinceCode, cityCode, subDistrictCode, villageCode, postalCode, isMainShop } = params;

  try {
    const [country, province, city, subDistrict, village] = await Promise.all([
      prisma.country.findFirst({ where: { isoCode: countryIsoCode } }),
      prisma.province.findFirst({ where: { code: provinceCode } }),
      prisma.city.findFirst({ where: { code: cityCode } }),
      prisma.subDistrict.findFirst({ where: { code: subDistrictCode } }),
      villageCode ? prisma.village.findFirst({ where: { code: villageCode } }) : null,
    ]);

    return await prisma.$transaction(async (tx) => {
      if (isMainShop) {
        await tx.shop.updateMany({
          where: { isMainShop: true },
          data: { isMainShop: false },
        });
      } else {
        const totalShop = await tx.shop.count();
        if (totalShop === 0) {
          params.isMainShop = true;
        }
      }

      return await tx.shop.create({
        data: {
          name,
          address,
          countryIsoCode,
          countryName: country?.name || "N/A",
          provinceCode,
          provinceName: province?.name || "N/A",
          cityCode,
          cityName: city?.name || "N/A",
          subDistrictCode,
          subDistrictName: subDistrict?.name || "N/A",
          villageCode: villageCode || "N/A",
          villageName: village?.name || "N/A",
          postalCode,
          isMainShop: params.isMainShop || false,
        },
      });
    });
  } catch (error) {
    logError("ShopService.createShop", error);
    throw error;
  }
};

export const updateShop = async (params: UpdateShopParams) => {
  const { id, name, address, countryIsoCode, provinceCode, cityCode, subDistrictCode, villageCode, postalCode, isMainShop } = params;

  const existingShop = await prisma.shop.findUnique({
    where: { id },
  });

  if (!existingShop) {
    throw new Error("Shop not found");
  }

  try {
    const [country, province, city, subDistrict, village] = await Promise.all([
      countryIsoCode ? prisma.country.findFirst({ where: { isoCode: countryIsoCode } }) : null,
      provinceCode ? prisma.province.findFirst({ where: { code: provinceCode } }) : null,
      cityCode ? prisma.city.findFirst({ where: { code: cityCode } }) : null,
      subDistrictCode ? prisma.subDistrict.findFirst({ where: { code: subDistrictCode } }) : null,
      villageCode && villageCode.trim() !== "" ? prisma.village.findFirst({ where: { code: villageCode } }) : null,
    ]);

    return await prisma.$transaction(async (tx) => {
      if (isMainShop === true) {
        await tx.shop.updateMany({
          where: {
            isMainShop: true,
            id: { not: id },
          },
          data: { isMainShop: false },
        });
      }

      const updated = await tx.shop.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(address && { address }),
          ...(countryIsoCode && { countryIsoCode }),
          ...(country && { countryName: country.name || "N/A" }),
          ...(provinceCode && { provinceCode }),
          ...(province && { provinceName: province.name || "N/A" }),
          ...(cityCode && { cityCode }),
          ...(city && { cityName: city.name || "N/A" }),
          ...(subDistrictCode && { subDistrictCode }),
          ...(subDistrict && { subDistrictName: subDistrict.name || "N/A" }),
          ...(villageCode && { villageCode }),
          ...(village && { villageName: village?.name || "N/A" }),
          ...(postalCode && { postalCode }),
          ...(isMainShop !== undefined && { isMainShop }),
        },
      });

      return updated;
    });
  } catch (error) {
    logError("ShopService.updateShop", error);
    throw error;
  }
};

export const deleteShop = async (id: string) => {
  const shop = await prisma.shop.findUnique({
    where: { id },
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  const deletedShop = await prisma.shop.delete({
    where: { id },
  });

  return deletedShop;
};
