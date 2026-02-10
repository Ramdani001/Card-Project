import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { saveFile, deleteFile } from "@/helpers/file.helper";

interface CreateEventParams {
  title: string;
  content: string;
  startDate: Date;
  endDate: Date;
  files: File[];
}

interface UpdateEventParams {
  id: string;
  title?: string;
  content?: string;
  startDate?: Date;
  endDate?: Date;
  files?: File[];
}

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const getEvents = async (options: Prisma.EventFindManyArgs) => {
  const finalOptions: Prisma.EventFindManyArgs = {
    ...options,
    include: {
      images: true,
    },
    orderBy: options.orderBy || { startDate: "desc" },
  };

  const [events, total] = await Promise.all([prisma.event.findMany(finalOptions), prisma.event.count({ where: finalOptions.where })]);

  return { events, total };
};

export const getEventById = async (id: string) => {
  return await prisma.event.findUnique({
    where: { id },
    include: { images: true },
  });
};

export const createEvent = async (params: CreateEventParams) => {
  const { title, content, startDate, endDate, files } = params;

  const slug = generateSlug(title);

  const existingSlug = await prisma.event.findUnique({ where: { slug } });
  if (existingSlug) throw new Error("Event title already exists (Slug conflict)");

  const uploadedFiles: { relativePath: string; absolutePath: string }[] = [];

  try {
    if (files && files.length > 0) {
      for (const file of files) {
        const saved = await saveFile(file);
        uploadedFiles.push(saved);
      }
    }

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return await tx.event.create({
        data: {
          title,
          slug,
          content,
          startDate,
          endDate,
          images: {
            create: uploadedFiles.map((f) => ({
              url: f.relativePath,
            })),
          },
        },
        include: { images: true },
      });
    });
  } catch (error) {
    for (const f of uploadedFiles) {
      await deleteFile(f.relativePath);
    }
    throw error;
  }
};

export const updateEvent = async (params: UpdateEventParams) => {
  const { id, title, content, startDate, endDate, files } = params;

  const event = await prisma.event.findUnique({ where: { id }, include: { images: true } });
  if (!event) throw new Error("Event not found");

  const uploadedFiles: { relativePath: string; absolutePath: string }[] = [];

  try {
    let slug = undefined;
    if (title && title !== event.title) {
      slug = generateSlug(title);
      const exist = await prisma.event.findUnique({ where: { slug } });
      if (exist && exist.id !== id) throw new Error("Event title already exists");
    }

    if (files && files.length > 0) {
      for (const file of files) {
        const saved = await saveFile(file);
        uploadedFiles.push(saved);
      }
    }

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (uploadedFiles.length > 0) {
        await tx.eventImage.deleteMany({ where: { eventId: id } });

        for (const oldImg of event.images) {
          await deleteFile(oldImg.url);
        }
      }

      const updated = await tx.event.update({
        where: { id },
        data: {
          ...(title && { title, slug }),
          ...(content && { content }),
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
          ...(uploadedFiles.length > 0 && {
            images: {
              create: uploadedFiles.map((f) => ({ url: f.relativePath })),
            },
          }),
        },
        include: { images: true },
      });

      return updated;
    });
  } catch (error) {
    for (const f of uploadedFiles) {
      await deleteFile(f.relativePath);
    }
    throw error;
  }
};

export const deleteEvent = async (id: string) => {
  const event = await prisma.event.findUnique({ where: { id }, include: { images: true } });
  if (!event) throw new Error("Event not found");

  await prisma.event.delete({ where: { id } });

  for (const img of event.images) {
    await deleteFile(img.url);
  }

  return true;
};
