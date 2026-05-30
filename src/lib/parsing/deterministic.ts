import { toStableId } from "@/lib/ids";
import { scorePrimitive } from "@/lib/parsing/scoring";
import type { GraphSnapshot } from "@/types/graph";

const CRYPTO_KEYS = ["algorithm", "alg", "primitive", "cipherSuite", "crypto", "signatureAlgorithm"];

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function collectCryptoMentions(value: unknown, path: string[] = []): Array<{ name: string; context: string }> {
  const mentions: Array<{ name: string; context: string }> = [];

  if (Array.isArray(value)) {
    value.forEach((item, index) => mentions.push(...collectCryptoMentions(item, [...path, String(index)])));
    return mentions;
  }

  if (!isObject(value)) return mentions;

  for (const [key, nested] of Object.entries(value)) {
    if (typeof nested === "string" && CRYPTO_KEYS.some((cryptoKey) => key.toLowerCase().includes(cryptoKey.toLowerCase()))) {
      mentions.push({ name: nested, context: [...path, key].join(".") });
    }
    mentions.push(...collectCryptoMentions(nested, [...path, key]));
  }

  return mentions;
}

function componentName(component: JsonObject, fallback: string) {
  return String(component.name ?? component["bom-ref"] ?? component.purl ?? component.group ?? fallback);
}

export function parseStructuredJson(raw: string, artifactId: string): GraphSnapshot | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const nodes = [];
  const edges = [];

  if (isObject(parsed) && Array.isArray(parsed.components)) {
    for (const [index, component] of parsed.components.entries()) {
      if (!isObject(component)) continue;
      const name = componentName(component, `component_${index}`);
      const componentId = toStableId(`component_${name}`);
      nodes.push({
        id: componentId,
        label: "SoftwareComponent" as const,
        name,
        vulnerabilityScore: 0,
        confidence: 1,
        sourceArtifactIds: [artifactId],
        attributes: { version: component.version, type: component.type }
      });

      for (const mention of collectCryptoMentions(component)) {
        const cryptoId = toStableId(`crypto_${name}_${mention.name}`);
        nodes.push({
          id: cryptoId,
          label: "CryptoAsset" as const,
          name: mention.name,
          vulnerabilityScore: scorePrimitive(mention.name),
          confidence: 1,
          sourceArtifactIds: [artifactId],
          attributes: { context: mention.context, component: name }
        });
        edges.push({
          source: componentId,
          target: cryptoId,
          type: "IMPLEMENTS" as const,
          confidence: 1,
          sourceArtifactIds: [artifactId]
        });
      }
    }
  }

  for (const mention of collectCryptoMentions(parsed)) {
    const cryptoId = toStableId(`crypto_${mention.name}_${mention.context}`);
    if (!nodes.some((node) => node.id === cryptoId)) {
      nodes.push({
        id: cryptoId,
        label: "CryptoAsset" as const,
        name: mention.name,
        vulnerabilityScore: scorePrimitive(mention.name),
        confidence: 1,
        sourceArtifactIds: [artifactId],
        attributes: { context: mention.context }
      });
    }
  }

  return nodes.length > 0 ? { nodes, edges } : null;
}

export function parseTextForCrypto(raw: string, artifactId: string): GraphSnapshot | null {
  const matches = raw.match(/\b(RSA|DSA|DH|ECDSA|ECDH|AES-256|SHA-256|SHA-384|SHA-512|ML-KEM|ML-DSA|SLH-DSA)\b/gi);
  if (!matches?.length) return null;

  const unique = Array.from(new Set(matches.map((match) => match.toUpperCase())));
  return {
    nodes: unique.map((name) => ({
      id: toStableId(`crypto_${name}`),
      label: "CryptoAsset",
      name,
      vulnerabilityScore: scorePrimitive(name),
      confidence: 0.95,
      sourceArtifactIds: [artifactId],
      attributes: { extractedFrom: "text" }
    })),
    edges: []
  };
}
