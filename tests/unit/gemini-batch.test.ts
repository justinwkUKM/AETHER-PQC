import { describe, expect, it } from "vitest";
import { buildBatchAnalysisPrompt } from "@/lib/ai/gemini";

describe("Gemini batch analysis prompt", () => {
  it("includes cross-file instructions and stable artifact identifiers", () => {
    const prompt = buildBatchAnalysisPrompt({
      projectName: "Payments Modernization",
      currentGraph: {
        nodes: [
          {
            id: "crypto_rsa_2048",
            label: "CryptoAsset",
            name: "RSA-2048",
            vulnerabilityScore: 10,
            confidence: 1,
            sourceArtifactIds: ["artifact_a"],
            attributes: {}
          }
        ],
        edges: []
      },
      artifacts: [
        {
          artifactId: "artifact_a",
          name: "cbom.json",
          type: "JSON",
          mimeType: "application/json",
          parserMode: "DETERMINISTIC",
          rawPayload: "component ledger-api uses RSA-2048"
        },
        {
          artifactId: "artifact_b",
          name: "architecture.md",
          type: "MARKDOWN",
          mimeType: "text/markdown",
          parserMode: "AI_MULTIMODAL",
          rawPayload: "ledger-api calls mobile-gateway"
        }
      ]
    });

    expect(prompt).toContain("Analyze these AETHER-PQC artifacts as one evidence set");
    expect(prompt).toContain("Infer cross-file relationships");
    expect(prompt).toContain("artifact_a");
    expect(prompt).toContain("artifact_b");
    expect(prompt).toContain("Do not remove deterministic high-risk findings");
  });

  it("truncates long artifact excerpts before sending them to Gemini", () => {
    const prompt = buildBatchAnalysisPrompt({
      projectName: "Large Evidence Set",
      currentGraph: { nodes: [], edges: [] },
      artifacts: [
        {
          artifactId: "large_artifact",
          name: "dump.txt",
          type: "TEXT",
          mimeType: "text/plain",
          parserMode: "AI_MULTIMODAL",
          rawPayload: "x".repeat(7000)
        }
      ]
    });

    expect(prompt).toContain("[truncated]");
    expect(prompt.match(/x/g)?.length).toBeLessThan(6500);
  });
});
