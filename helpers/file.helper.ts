import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = "uploads";

export const saveFile = async (file: File) => {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      console.error("Supabase Upload Error:", error);
      throw new Error("Gagal upload ke storage");
    }

    const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filename);

    const publicUrl = publicUrlData.publicUrl;

    return {
      filename: filename,
      relativePath: publicUrl,
      absolutePath: publicUrl,
    };
  } catch (err) {
    throw err;
  }
};

export const deleteFile = async (fileUrlOrPath: string | null) => {
  if (!fileUrlOrPath) return;

  try {
    const parts = fileUrlOrPath.split("/");
    const filename = parts[parts.length - 1];

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filename]);

    if (error) {
      console.error("Gagal hapus file di Supabase:", error);
    }
  } catch (error) {
    console.error("Error saat delete file:", error);
  }
};
