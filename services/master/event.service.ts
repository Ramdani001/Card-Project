import { deleteFile, saveFile } from "@/helpers/file.helper";
import { logError } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { generateSlug } from "@/utils";

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
  removedImageIds: string[];
}

export const getEvents = async (options: Prisma.EventFindManyArgs) => {
  const finalOptions: Prisma.EventFindManyArgs = {
    where: {
      ...options.where,
    },
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
  const uploadedFiles: any[] = [];

  try {
    if (files && files.length > 0) {
      for (const file of files) {
        const saved = await saveFile(file, "events");
        uploadedFiles.push(saved);
      }
    }

    return await prisma.$transaction(async (tx) => {
      return await tx.event.create({
        data: {
          title,
          slug,
          content,
          startDate,
          endDate,
          images: {
            create: uploadedFiles.map((f) => ({
              ...f,
            })),
          },
        },
        include: { images: true },
      });
    });
  } catch (error) {
    for (const f of uploadedFiles) {
      if (f.path) await deleteFile(f.path).catch(console.error);
    }

    logError("EventService.createEvent", error);
    throw error;
  }
};
export const updateEvent = async (params: UpdateEventParams) => {
  const { id, title, content, startDate, endDate, files, removedImageIds } = params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!event) throw new Error("Event not found");

  const newUploadedFiles: any[] = [];

  if (files && files.length > 0) {
    try {
      const uploadPromises = files.map((file) => saveFile(file, "events"));
      const results = await Promise.all(uploadPromises);
      newUploadedFiles.push(...results);
    } catch (uploadError) {
      await Promise.all(newUploadedFiles.map((f) => deleteFile(f.path).catch(console.error)));

      logError("EventService.updateEvent", uploadError);
      throw uploadError;
    }
  }

  try {
    let slug = undefined;
    if (title && title !== event.title) {
      slug = generateSlug(title);
      const exist = await prisma.event.findUnique({ where: { slug } });
      if (exist && exist.id !== id) throw new Error("Event title already exists");
    }

    const updatedEvent = await prisma.$transaction(async (tx) => {
      if (removedImageIds && removedImageIds.length > 0) {
        await tx.eventImage.deleteMany({
          where: {
            id: { in: removedImageIds },
            eventId: id,
          },
        });
      }

      if (newUploadedFiles.length > 0) {
        await tx.eventImage.createMany({
          data: newUploadedFiles.map((f) => ({
            eventId: id,
            url: f.url,
            path: f.path,
            originalName: f.originalName,
            fileName: f.fileName,
            mimeType: f.mimeType,
            size: f.size,
          })),
        });
      }

      return await tx.event.update({
        where: { id },
        data: {
          ...(title && { title, slug }),
          ...(content && { content }),
          ...(startDate && { startDate: new Date(startDate) }),
          ...(endDate && { endDate: new Date(endDate) }),
        },
        include: { images: true },
      });
    });

    if (removedImageIds && removedImageIds.length > 0) {
      const imagesToDelete = event.images.filter((img) => removedImageIds.includes(img.id));
      await Promise.all(imagesToDelete.map((img) => deleteFile(img.path).catch(console.error)));
    }

    return updatedEvent;
  } catch (error) {
    if (newUploadedFiles.length > 0) {
      await Promise.all(newUploadedFiles.map((f) => deleteFile(f.path).catch(console.error)));
    }

    logError("EventService.updateEvent", error);
    throw error;
  }
};

export const deleteEvent = async (id: string) => {
  const event = await prisma.event.findUnique({ where: { id }, include: { images: true } });
  if (!event) throw new Error("Event not found");

  await prisma.event.delete({ where: { id } });

  for (const img of event.images) {
    await deleteFile(img.path);
  }

  return true;
};
