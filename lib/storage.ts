import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs/promises";
import path from "path";

const s3Client = new S3Client({
  endpoint: process.env.IDCLOUDHOST_ENDPOINT,
  region: process.env.IDCLOUDHOST_REGION || "sg1",
  credentials: {
    accessKeyId: process.env.IDCLOUDHOST_ACCESS_KEY || "",
    secretAccessKey: process.env.IDCLOUDHOST_SECRET_KEY || "",
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.IDCLOUDHOST_BUCKET_NAME || "";

const getRootFolder = () => process.env.IDCLOUDHOST_ROOT_FOLDER || "Development";
const sanitizeFolder = (folder: string) => folder.replace(/[^a-zA-Z0-9_-]/g, "");

export const saveFile = async (file: File, folder: string = "") => {
  if (!BUCKET_NAME) throw new Error("S3 Bucket Name is not configured");

  const fileExt = file.name.split(".").pop() || "bin";
  const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const root = getRootFolder();
  const sanitizedFolder = sanitizeFolder(folder);

  const key = sanitizedFolder ? `${root}/${sanitizedFolder}/${uniqueFileName}` : `${root}/${uniqueFileName}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        ACL: "public-read",
      })
    );

    return {
      url: `${process.env.IDCLOUDHOST_ENDPOINT}/${BUCKET_NAME}/${key}`,
      path: key,
      originalName: file.name,
      fileName: uniqueFileName,
      mimeType: file.type,
      size: file.size,
    };
  } catch (error) {
    console.error("Failed to upload to S3:", error);
    throw new Error("File upload failed");
  }
};

export const deleteFile = async (pathName: string | null) => {
  if (!pathName) return;

  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: pathName,
      })
    );
  } catch (err) {
    console.error("Failed to delete file from S3:", err);
    throw new Error("File deletion failed");
  }
};

export const readLocalFileToBuffer = async (filePath: string): Promise<Buffer> => {
  const absolutePath = path.join(process.cwd(), "public", filePath);
  return await fs.readFile(absolutePath);
};
