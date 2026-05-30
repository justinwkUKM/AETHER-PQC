import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Storage } from "@google-cloud/storage";
import { env } from "@/lib/env";
import { toStableId } from "@/lib/ids";

export type StoredObject = {
  storagePath: string;
};

export async function storeArtifactObject(params: {
  userId: string;
  projectId: string;
  artifactId: string;
  fileName: string;
  buffer: Buffer;
  mimeType: string;
}): Promise<StoredObject> {
  const originalExtension = path.extname(params.fileName);
  const extension = originalExtension.toLowerCase().replace(/[^a-z0-9.]/g, "");
  const baseName = path.basename(params.fileName, originalExtension);
  const safeFileName = `${toStableId(baseName) || "artifact"}${extension}`;
  const objectPath = `users/${params.userId}/projects/${params.projectId}/artifacts/${params.artifactId}/${safeFileName}`;

  const storageDriver = process.env.STORAGE_DRIVER ?? env.STORAGE_DRIVER;
  const gcsBucketName = process.env.GCS_BUCKET_NAME ?? env.GCS_BUCKET_NAME;
  const localStorageDir = process.env.LOCAL_STORAGE_DIR ?? env.LOCAL_STORAGE_DIR;

  if (storageDriver === "gcs") {
    if (!gcsBucketName) throw new Error("GCS_BUCKET_NAME is required when STORAGE_DRIVER=gcs.");
    const storage = new Storage();
    await storage.bucket(gcsBucketName).file(objectPath).save(params.buffer, {
      metadata: { contentType: params.mimeType }
    });
    return { storagePath: `gs://${gcsBucketName}/${objectPath}` };
  }

  const localPath = path.join(process.cwd(), localStorageDir, objectPath);
  await mkdir(path.dirname(localPath), { recursive: true });
  await writeFile(localPath, params.buffer);
  return { storagePath: localPath };
}
