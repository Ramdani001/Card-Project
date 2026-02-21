import prisma from "@/lib/prisma";

export const getAllConfigs = async () => {
  return await prisma.appConfig.findMany({
    orderBy: { key: "asc" },
  });
};

export const getConfigByKey = async (key: string) => {
  return await prisma.appConfig.findUnique({
    where: { key },
  });
};

export const setConfig = async (key: string, value: string) => {
  return await prisma.appConfig.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
};

export const deleteConfig = async (key: string) => {
  const existing = await prisma.appConfig.findUnique({ where: { key } });
  if (!existing) throw new Error("Config not found");

  return await prisma.appConfig.delete({
    where: { key },
  });
};
