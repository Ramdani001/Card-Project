import { deleteFile, saveFile } from "@/helpers/file.helper";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";

interface CreateBannerParams {
  link?: string | null;
  startDate: Date;
  endDate: Date;
  file: File;
}

interface UpdateBannerParams {
  id: string;
  link?: string | null;
  startDate?: Date;
  endDate?: Date;
  file?: File | null;
}

export const getBanners = async (options: Prisma.BannerImageFindManyArgs) => {
  const finalOptions: Prisma.BannerImageFindManyArgs = {
    ...options,
  };

  const [banners, total] = await Promise.all([prisma.bannerImage.findMany(finalOptions), prisma.bannerImage.count({ where: finalOptions.where })]);

  return { banners, total };
};

export const getActiveBanners = async () => {
  const now = new Date();
  return await prisma.bannerImage.findMany({
    where: {
      startDate: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const createBanner = async (params: CreateBannerParams) => {
  const { startDate, endDate, file, link } = params;

  if (endDate < startDate) {
    throw new Error("End date must be after start date");
  }

  let uploadedFilePath: string | null = null;

  try {
    const fileData = await saveFile(file);
    uploadedFilePath = fileData.path;

    const banner = await prisma.bannerImage.create({
      data: {
        link,
        startDate,
        endDate,
        ...fileData,
      },
    });

    return banner;
  } catch (error) {
    if (uploadedFilePath) {
      await deleteFile(uploadedFilePath).catch(console.error);
    }
    throw error;
  }
};

export const updateBanner = async (params: UpdateBannerParams) => {
  const { id, startDate, endDate, file, link } = params;

  const existingBanner = await prisma.bannerImage.findUnique({ where: { id } });
  if (!existingBanner) throw new Error("Banner not found");

  const newStart = startDate || existingBanner.startDate;
  const newEnd = endDate || existingBanner.endDate;
  if (newEnd < newStart) {
    throw new Error("End date must be after start date");
  }

  let newFileData: any = null;

  if (file && file.size > 0) {
    newFileData = await saveFile(file);
  }

  try {
    const updatedBanner = await prisma.bannerImage.update({
      where: { id },
      data: {
        ...(link && { link }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(newFileData ? newFileData : {}),
      },
    });

    if (newFileData && existingBanner.path) {
      await deleteFile(existingBanner.path).catch(console.error);
    }

    return updatedBanner;
  } catch (error) {
    if (newFileData?.path) {
      await deleteFile(newFileData.path).catch(console.error);
    }
    throw error;
  }
};

export const deleteBanner = async (id: string) => {
  const banner = await prisma.bannerImage.findUnique({ where: { id } });
  if (!banner) throw new Error("Banner not found");

  await prisma.bannerImage.delete({ where: { id } });

  if (banner.path) {
    await deleteFile(banner.path).catch(console.error);
  }

  return true;
};
