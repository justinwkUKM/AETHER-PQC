import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { storeArtifactObject } from "@/lib/storage";

let tempDir: string | undefined;

afterEach(async () => {
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
});

describe("artifact storage", () => {
  it("sanitizes uploaded filenames before writing to local storage", async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "aether-storage-"));
    process.env.STORAGE_DRIVER = "local";
    process.env.LOCAL_STORAGE_DIR = path.relative(process.cwd(), tempDir);

    const stored = await storeArtifactObject({
      userId: "user_1",
      projectId: "project_1",
      artifactId: "artifact_1",
      fileName: "../Secret Diagram 01.PNG",
      buffer: Buffer.from("image-bytes"),
      mimeType: "image/png"
    });

    expect(stored.storagePath).toContain("secret_diagram_01.png");
    expect(stored.storagePath.startsWith(tempDir)).toBe(true);
    await expect(readFile(stored.storagePath, "utf8")).resolves.toBe("image-bytes");
  });
});
