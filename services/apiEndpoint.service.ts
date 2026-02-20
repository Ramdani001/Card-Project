import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";

interface CreateApiEndpointParams {
  url: string;
  description?: string;
}

interface UpdateApiEndpointParams {
  id: string;
  url?: string;
  description?: string;
}

export const getApiEndpoints = async (options: Prisma.ApiEndpointFindManyArgs) => {
  const finalOptions: Prisma.ApiEndpointFindManyArgs = {
    ...options,
    where: {
      ...options.where,
    },
    orderBy: { url: "asc" },
  };

  const [apiEndpoitns, total] = await Promise.all([
    prisma.apiEndpoint.findMany(finalOptions),
    prisma.apiEndpoint.count({ where: finalOptions.where }),
  ]);

  return { apiEndpoitns, total };
};

export const getApiEndpointById = async (id: string) => {
  return await prisma.apiEndpoint.findUnique({
    where: { id },
  });
};

export const createApiEndpoint = async (params: CreateApiEndpointParams) => {
  const { url, description } = params;

  return await prisma.apiEndpoint.create({
    data: {
      url,
      description,
    },
  });
};

export const updateApiEndpoint = async (params: UpdateApiEndpointParams) => {
  const { id, url, description } = params;

  const existing = await prisma.apiEndpoint.findUnique({ where: { id } });
  if (!existing) throw new Error("Api Endpoint not found");

  return await prisma.apiEndpoint.update({
    where: { id },
    data: {
      ...(url && { url }),
      ...(description && { description }),
    },
  });
};

export const deleteApiEndpoint = async (id: string) => {
  const existing = await prisma.apiEndpoint.findUnique({ where: { id } });
  if (!existing) throw new Error("Api Endpoint not found");

  return await prisma.apiEndpoint.delete({
    where: { id },
  });
};
