import prisma from "@/lib/prisma";

export const getAllConfigs = async () => {
  return await prisma.appConfig.findMany({
    orderBy: { key: "asc" },
  });
};

export const getConfigByKey = async (key: string) => {
  return await prisma.appConfig.findFirst({
    where: { key, isActive: true },
  });
};

export const setConfig = async (key: string, value: string) => {
  return await prisma.appConfig.upsert({
    where: { key_isActive: { key, isActive: true } },
    update: { value },
    create: { key, value },
  });
};

export const deleteConfig = async (key: string) => {
  const existing = await prisma.appConfig.findFirst({ where: { key, isActive: true } });
  if (!existing) throw new Error("Config not found");

  return await prisma.appConfig.update({
    where: { key_isActive: { key, isActive: true } },
    data: { isActive: false },
  });
};
