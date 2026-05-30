import { describe, expect, it } from "vitest";
import { parseStructuredJson, parseTextForCrypto } from "@/lib/parsing/deterministic";

describe("deterministic parser", () => {
  it("extracts crypto assets from component JSON", () => {
    const graph = parseStructuredJson(
      JSON.stringify({
        components: [
          {
            name: "payments",
            version: "1.0.0",
            cryptoProperties: { algorithm: "RSA-2048" }
          }
        ]
      }),
      "artifact_1"
    );

    expect(graph?.nodes.some((node) => node.label === "SoftwareComponent" && node.name === "payments")).toBe(true);
    expect(graph?.nodes.some((node) => node.label === "CryptoAsset" && node.vulnerabilityScore === 10)).toBe(true);
    expect(graph?.edges).toHaveLength(1);
  });

  it("keeps component inventory even when no crypto signals are present", () => {
    const graph = parseStructuredJson(JSON.stringify({ components: [{ name: "plain" }] }), "artifact_1");
    expect(graph?.nodes).toHaveLength(1);
    expect(graph?.nodes[0].label).toBe("SoftwareComponent");
  });

  it("extracts known primitives from text", () => {
    const graph = parseTextForCrypto("This system uses ECDSA and AES-256.", "artifact_2");
    expect(graph?.nodes.map((node) => node.name).sort()).toEqual(["AES-256", "ECDSA"]);
  });

  it("extracts crypto from non-component JSON fields", () => {
    const graph = parseStructuredJson(JSON.stringify({ service: { signatureAlgorithm: "ECDSA" } }), "artifact_3");
    expect(graph?.nodes[0].name).toBe("ECDSA");
    expect(graph?.nodes[0].vulnerabilityScore).toBe(10);
  });

  it("returns null for invalid JSON and text without known crypto", () => {
    expect(parseStructuredJson("{", "artifact_4")).toBeNull();
    expect(parseTextForCrypto("no relevant primitive", "artifact_4")).toBeNull();
  });
});
