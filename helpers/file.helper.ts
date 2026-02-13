import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export const saveFile = async (file: File) => {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

  const relativePath = `/uploads/${filename}`;
  const absolutePath = path.join(UPLOAD_DIR, filename);

  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }

  await writeFile(absolutePath, buffer);

  return { filename, relativePath, absolutePath };
};

export const deleteFile = async (relativePath: string | null) => {
  if (!relativePath) return;

  const cleanPath = relativePath.startsWith("/") ? relativePath.slice(1) : relativePath;
  const absolutePath = path.join(process.cwd(), "public", cleanPath);

  if (existsSync(absolutePath)) {
    try {
      await unlink(absolutePath);
    } catch (error) {
      console.error(`Gagal menghapus file: ${absolutePath}`, error);
    }
  }
};
