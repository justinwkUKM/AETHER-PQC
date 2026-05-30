import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Storage } from "@google-cloud/storage";
import { env } from "@/lib/env";

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
  const objectPath = `users/${params.userId}/projects/${params.projectId}/artifacts/${params.artifactId}/${params.fileName}`;

  if (env.STORAGE_DRIVER === "gcs") {
    if (!env.GCS_BUCKET_NAME) throw new Error("GCS_BUCKET_NAME is required when STORAGE_DRIVER=gcs.");
    const storage = new Storage();
    await storage.bucket(env.GCS_BUCKET_NAME).file(objectPath).save(params.buffer, {
      metadata: { contentType: params.mimeType }
    });
    return { storagePath: `gs://${env.GCS_BUCKET_NAME}/${objectPath}` };
  }

  const localPath = path.join(process.cwd(), env.LOCAL_STORAGE_DIR, objectPath);
  await mkdir(path.dirname(localPath), { recursive: true });
  await writeFile(localPath, params.buffer);
  return { storagePath: localPath };
}
