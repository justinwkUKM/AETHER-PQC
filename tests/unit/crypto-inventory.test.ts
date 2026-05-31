import { describe, expect, it } from "vitest";
import { buildCryptoInventory } from "@/lib/crypto-inventory";
import type { GraphSnapshot } from "@/types/graph";

const graph: GraphSnapshot = {
  nodes: [
    {
      id: "rsa",
      label: "CryptoAsset",
      name: "RSA-2048",
      vulnerabilityScore: 10,
      exposureScore: 9,
      exposureLevel: "INTERNET_EDGE",
      effectiveRiskScore: 9.6,
      exposureReasons: ["Gateway"],
      confidence: 0.92,
      sourceArtifactIds: ["a1"],
      attributes: {}
    },
    {
      id: "tls13",
      label: "CryptoAsset",
      name: "TLS 1.3",
      vulnerabilityScore: 1,
      exposureScore: 8,
      exposureLevel: "INTERNET_EDGE",
      effectiveRiskScore: 1,
      exposureReasons: ["Public endpoint"],
      confidence: 0.95,
      sourceArtifactIds: ["a2"],
      attributes: {}
    },
    {
      id: "ambiguous",
      label: "SoftwareComponent",
      name: "Legacy crypto module",
      vulnerabilityScore: 5,
      exposureScore: 2,
      exposureLevel: "INTERNAL",
      effectiveRiskScore: 3.2,
      exposureReasons: [],
      confidence: 0.5,
      sourceArtifactIds: ["a3"],
      attributes: { algorithm: "custom DH exchange" }
    }
  ],
  edges: []
};

describe("crypto inventory", () => {
  it("builds sorted inventory with posture and artifact parser evidence", () => {
    const inventory = buildCryptoInventory(graph, [
      { id: "a1", name: "gateway.md", type: "text/markdown", parserMode: "DETERMINISTIC" },
      { id: "a2", name: "tls.png", type: "image/png", parserMode: "AI_MULTIMODAL" },
      { id: "a3", name: "notes.txt", type: "text/plain", parserMode: "HYBRID" }
    ]);

    expect(inventory).toHaveLength(3);
    expect(inventory[0].name).toBe("RSA-2048");
    expect(inventory[0].posture).toBe("Vulnerable");
    expect(inventory[0].parserModes).toEqual(["DETERMINISTIC"]);
    expect(inventory[1].reviewStatus).toBe("Needs review");
    expect(inventory[2].posture).toBe("Quantum-safe");
    expect(inventory[2].parserModes).toEqual(["AI_MULTIMODAL"]);
  });

  it("uses attributes as the displayed primitive when available", () => {
    const inventory = buildCryptoInventory(graph, []);
    expect(inventory.find((item) => item.id === "ambiguous")?.name).toBe("custom DH exchange");
  });
});
