import { describe, expect, it } from "vitest";
import { mergeGraphSnapshots } from "@/lib/graph";
import { parseStructuredJson, parseTextForCrypto } from "@/lib/parsing/deterministic";
import { generateDeterministicRemediations } from "@/lib/remediation/deterministic";

describe("deterministic ingestion pipeline", () => {
  it("extracts, merges, scores, and remediates a mixed artifact set", () => {
    const cbom = parseStructuredJson(
      JSON.stringify({
        components: [
          { name: "ledger-api", cryptoProperties: { algorithm: "RSA-2048" } },
          { name: "vault", cryptoProperties: { algorithm: "AES-256" } }
        ]
      }),
      "json_artifact"
    );
    const notes = parseTextForCrypto("Architecture note: the mobile gateway still performs ECDH.", "text_artifact");

    const graph = mergeGraphSnapshots(cbom, notes);
    const remediations = generateDeterministicRemediations(graph);

    expect(graph.nodes.filter((node) => node.label === "CryptoAsset")).toHaveLength(3);
    expect(remediations.map((item) => item.priority)).toEqual(["CRITICAL", "CRITICAL"]);
  });
});
