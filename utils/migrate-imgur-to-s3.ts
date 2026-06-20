/* eslint-disable no-console */
import "dotenv/config";
import prisma from "@/lib/prisma";
import { saveFile } from "@/lib/storage";

const getTimestamp = () => new Date().toLocaleTimeString();

async function main() {
  const images = await prisma.imageCard.findMany({
    where: {
      url: { contains: "imgur.com" },
    },
  });

  console.log(`[${getTimestamp()}] Found ${images.length} images to migrate...`);

  for (const img of images) {
    if (!img.url) continue;

    try {
      console.log(`[${getTimestamp()}] Migrating ID ${img.id}: ${img.url}`);

      const response = await fetch(img.url);
      if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);

      const buffer = Buffer.from(await response.arrayBuffer());
      const mimeType = response.headers.get("content-type") || "image/jpeg";

      const file = new File([new Uint8Array(buffer)], "migrated-image.jpg", {
        type: mimeType,
      });

      const fileData = await saveFile(file, "cards");

      await prisma.imageCard.update({
        where: { id: img.id },
        data: fileData,
      });

      console.log(`[${getTimestamp()}] Successfully migrated ID: ${img.id}`);
    } catch (error) {
      console.error(`[${getTimestamp()}] Migration failed for ID ${img.id}:`, error);
    }
  }

  console.log("Migration batch completed");
  await prisma.$disconnect();
}

main();
