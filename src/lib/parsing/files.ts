import pdfParse from "pdf-parse";

export const SUPPORTED_MIME_TYPES = new Set([
  "application/json",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/csv",
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp"
]);

export function inferArtifactType(fileName: string, mimeType: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (mimeType.includes("json") || ext === "json") return "JSON";
  if (mimeType.includes("csv") || ext === "csv") return "CSV";
  if (mimeType.includes("markdown") || ext === "md") return "MARKDOWN";
  if (mimeType.includes("pdf") || ext === "pdf") return "PDF";
  if (mimeType.startsWith("image/") || ["png", "jpg", "jpeg", "webp"].includes(ext ?? "")) return "IMAGE";
  return "TEXT";
}

export function assertSupportedFile(fileName: string, mimeType: string, sizeBytes: number, maxBytes: number) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const extensionSupported = ["json", "csv", "txt", "md", "pdf", "png", "jpg", "jpeg", "webp"].includes(ext ?? "");
  if (!SUPPORTED_MIME_TYPES.has(mimeType) && !extensionSupported) {
    throw new Error(`Unsupported artifact type: ${mimeType || fileName}`);
  }
  if (sizeBytes > maxBytes) {
    throw new Error(`Artifact exceeds ${Math.round(maxBytes / 1024 / 1024)}MB limit.`);
  }
}

export async function extractText(buffer: Buffer, mimeType: string, fileName: string) {
  const type = inferArtifactType(fileName, mimeType);

  if (type === "IMAGE") return "";
  if (type === "PDF") {
    const result = await pdfParse(buffer);
    return result.text.trim();
  }

  return buffer.toString("utf8");
}
