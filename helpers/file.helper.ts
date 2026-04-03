import fs from "fs/promises";
import path from "path";

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

const generateFileName = (file: File) => {
  const fileExt = path.extname(file.name); // Lebih aman daripada split pop
  return `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExt}`;
};

const safeJoin = (base: string, ...parts: string[]) => {
  const joined = path.join(base, ...parts);
  if (!joined.startsWith(base)) {
    throw new Error("Akses path ilegal!");
  }
  return joined;
};

export const saveFile = async (file: File, folder: string = "") => {
  const uniqueFileName = generateFileName(file);

  const sanitizedFolder = folder.replace(/[^\w\s-]/gi, "");
  const targetDir = safeJoin(LOCAL_UPLOAD_DIR, sanitizedFolder);

  try {
    await fs.mkdir(targetDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(targetDir, uniqueFileName);

    await fs.writeFile(filePath, buffer);

    return {
      url: path.posix.join("/uploads", sanitizedFolder, uniqueFileName),
      path: path.join(sanitizedFolder, uniqueFileName),
      originalName: file.name,
      fileName: uniqueFileName,
      mimeType: file.type,
      size: file.size,
    };
  } catch (error) {
    console.error("Gagal menyimpan file:", error);
    throw new Error("File upload failed");
  }
};

export const deleteFile = async (pathName: string | null) => {
  if (!pathName) return;

  try {
    const filePath = safeJoin(LOCAL_UPLOAD_DIR, pathName);

    await fs.access(filePath);
    await fs.unlink(filePath);
  } catch (err) {
    console.error("Gagal hapus file lokal:", err);
  }
};
