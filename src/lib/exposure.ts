import type { GraphNode, GraphSnapshot } from "@/types/graph";

const EDGE_EXPOSURE_DECAY = 1.75;

function clampScore(score: number) {
  return Math.max(0, Math.min(10, Math.round(score * 10) / 10));
}

export function effectiveRiskScore(vulnerabilityScore: number, exposureScore: number) {
  return clampScore(vulnerabilityScore * (0.55 + 0.45 * clampScore(exposureScore) / 10));
}

function levelForScore(score: number): GraphNode["exposureLevel"] {
  if (score >= 8) return "INTERNET_EDGE";
  if (score >= 5) return "PARTNER";
  if (score > 0) return "INTERNAL";
  return "UNKNOWN";
}

function localExposure(node: GraphNode) {
  const haystack = `${node.label} ${node.name} ${JSON.stringify(node.attributes)}`.toLowerCase();
  const reasons: string[] = [];
  let score = node.exposureScore ?? 0;

  if (node.label === "ExternalService") {
    score = Math.max(score, 9);
    reasons.push("External service boundary");
  }
  if (/\b(public|internet|external|edge|gateway|ingress|load balancer|load-balancer|lb|dmz|api gateway|reverse proxy)\b/i.test(haystack)) {
    score = Math.max(score, 8.5);
    reasons.push("Network-edge keyword");
  }
  if (/\b(tls|https|443|8443|port|listener|endpoint|inbound|north-south)\b/i.test(haystack)) {
    score = Math.max(score, 7);
    reasons.push("Network protocol or listener hint");
  }
  if (/\b(partner|vendor|third-party|third party|b2b)\b/i.test(haystack)) {
    score = Math.max(score, 6);
    reasons.push("Partner or third-party path");
  }
  if (/\b(internal|private|backend|worker|batch|offline)\b/i.test(haystack) && score === 0) {
    score = 2;
    reasons.push("Internal/private context");
  }

  return { score: clampScore(score), reasons };
}

export function enrichGraphExposure(graph: GraphSnapshot): GraphSnapshot {
  const nodes = graph.nodes.map((node) => {
    const local = localExposure(node);
    return {
      ...node,
      exposureScore: local.score,
      exposureLevel: local.score > 0 ? levelForScore(local.score) : node.exposureLevel,
      exposureReasons: Array.from(new Set([...(node.exposureReasons ?? []), ...local.reasons])),
      exposurePath: node.exposurePath
    };
  });
  const adjacency = new Map<string, string[]>();

  for (const edge of graph.edges) {
    adjacency.set(edge.source, [...(adjacency.get(edge.source) ?? []), edge.target]);
    adjacency.set(edge.target, [...(adjacency.get(edge.target) ?? []), edge.source]);
  }

  const seeds = nodes.filter((node) => node.exposureScore > 0);
  const best = new Map(nodes.map((node) => [node.id, { score: node.exposureScore, path: [node.id], reasons: node.exposureReasons }]));
  const queue = seeds.map((node) => ({ id: node.id, score: node.exposureScore, path: [node.id], reasons: node.exposureReasons }));

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;

    for (const nextId of adjacency.get(current.id) ?? []) {
      const nextScore = clampScore(current.score - EDGE_EXPOSURE_DECAY);
      if (nextScore <= 0) continue;
      const existing = best.get(nextId);
      if (existing && existing.score >= nextScore) continue;

      const nextPath = [...current.path, nextId];
      const nextReasons = Array.from(new Set([...current.reasons, "Exposure propagated through topology"]));
      best.set(nextId, { score: nextScore, path: nextPath, reasons: nextReasons });
      queue.push({ id: nextId, score: nextScore, path: nextPath, reasons: nextReasons });
    }
  }

  return {
    nodes: nodes.map((node) => {
      const exposure = best.get(node.id);
      const exposureScore = exposure?.score ?? 0;
      return {
        ...node,
        exposureScore,
        exposureLevel: levelForScore(exposureScore),
        effectiveRiskScore: effectiveRiskScore(node.vulnerabilityScore, exposureScore),
        exposureReasons: Array.from(new Set([...(node.exposureReasons ?? []), ...(exposure?.reasons ?? [])])),
        exposurePath: exposure?.path
      };
    }),
    edges: graph.edges
  };
}
