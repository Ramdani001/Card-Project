/* eslint-disable no-console */
import "dotenv/config";
import prisma from "@/lib/prisma";
import { saveFile, readLocalFileToBuffer } from "@/lib/storage";

const getTimestamp = () => new Date().toLocaleTimeString();

async function main() {
  const images = await prisma.imageCard.findMany({
    where: {
      url: {
        not: { contains: "imgur" },
      },
      AND: {
        url: {
          not: { contains: "is3.cloudhost.id" },
        },
      },
    },
  });

  console.log(`[${getTimestamp()}] Found ${images.length} local images to move to S3...`);

  for (const img of images) {
    if (!img.path) continue;

    try {
      console.log(`[${getTimestamp()}] Processing ID ${img.id}: ${img.path}`);

      const buffer = await readLocalFileToBuffer(img.path);

      const file = new File([new Uint8Array(buffer)], img.originalName || "image.jpg", {
        type: img.mimeType || "image/jpeg",
      });

      const fileData = await saveFile(file, "cards");

      await prisma.imageCard.update({
        where: { id: img.id },
        data: { path: fileData.path },
      });

      console.log(`[${getTimestamp()}] Successful local migration to S3: ${img.id}`);
    } catch (error) {
      console.error(`[${getTimestamp()}] Local migration failed for ID ${img.id}:`, error);
    }
  }

  await prisma.$disconnect();
}

main();
