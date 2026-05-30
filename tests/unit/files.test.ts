import { describe, expect, it } from "vitest";
import { assertSupportedFile, extractText, inferArtifactType } from "@/lib/parsing/files";

describe("file validation", () => {
  it("infers artifact types from names and mime types", () => {
    expect(inferArtifactType("diagram.png", "image/png")).toBe("IMAGE");
    expect(inferArtifactType("notes.md", "text/markdown")).toBe("MARKDOWN");
    expect(inferArtifactType("report.pdf", "application/pdf")).toBe("PDF");
  });

  it("rejects unsupported files", () => {
    expect(() => assertSupportedFile("archive.zip", "application/zip", 10, 100)).toThrow("Unsupported");
  });

  it("rejects oversized files", () => {
    expect(() => assertSupportedFile("scan.pdf", "application/pdf", 101, 100)).toThrow("exceeds");
  });

  it("extracts utf-8 text for text artifacts", async () => {
    await expect(extractText(Buffer.from("RSA architecture note"), "text/plain", "note.txt")).resolves.toBe("RSA architecture note");
  });
});
