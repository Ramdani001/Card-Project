import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";

const STORAGE_MODE = process.env.STORAGE_MODE || "supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = STORAGE_MODE === "supabase" ? createClient(supabaseUrl, supabaseKey) : null;

const BUCKET_NAME = "uploads";
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

const generateFileName = (file: File) => {
  const fileExt = file.name.split(".").pop();
  return `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
};

export const saveFile = async (file: File) => {
  const uniqueFileName = generateFileName(file);

  if (STORAGE_MODE === "local") {
    await fs.mkdir(LOCAL_UPLOAD_DIR, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filePath = path.join(LOCAL_UPLOAD_DIR, uniqueFileName);
    await fs.writeFile(filePath, buffer);

    return {
      url: `/uploads/${uniqueFileName}`,
      path: uniqueFileName,
      originalName: file.name,
      fileName: uniqueFileName,
      mimeType: file.type,
      size: file.size,
    };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { error } = await supabase!.storage.from(BUCKET_NAME).upload(uniqueFileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      console.error("Supabase Upload Error:", error);
      throw new Error("Gagal upload ke storage");
    }

    const { data } = supabase!.storage.from(BUCKET_NAME).getPublicUrl(uniqueFileName);

    return {
      url: data.publicUrl,
      path: uniqueFileName,
      originalName: file.name,
      fileName: uniqueFileName,
      mimeType: file.type,
      size: file.size,
    };
  } catch (err) {
    throw err;
  }
};

export const deleteFile = async (pathName: string | null) => {
  if (!pathName) return;

  if (STORAGE_MODE === "local") {
    try {
      const filePath = path.join(LOCAL_UPLOAD_DIR, pathName);
      await fs.unlink(filePath);
    } catch (err) {
      console.error("Gagal hapus file lokal:", err);
    }
    return;
  }

  try {
    const { error } = await supabase!.storage.from(BUCKET_NAME).remove([pathName]);

    if (error) {
      console.error("Gagal hapus file di Supabase:", error);
    }
  } catch (error) {
    console.error("Error saat delete file:", error);
  }
};
