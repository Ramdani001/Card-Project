import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = "uploads";

export const saveFile = async (file: File) => {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = file.name.split(".").pop();
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(uniqueFileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      console.error("Supabase Upload Error:", error);
      throw new Error("Gagal upload ke storage");
    }

    const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(uniqueFileName);

    return {
      url: publicUrlData.publicUrl,
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

export const deleteFile = async (path: string | null) => {
  if (!path) return;

  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    if (error) {
      console.error("Gagal hapus file di Supabase:", error);
    }
  } catch (error) {
    console.error("Error saat delete file:", error);
  }
};
