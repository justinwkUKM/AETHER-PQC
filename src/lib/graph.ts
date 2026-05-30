import { toStableId } from "@/lib/ids";
import { graphSnapshotSchema, type GraphEdge, type GraphNode, type GraphSnapshot } from "@/types/graph";

export const emptyGraph: GraphSnapshot = { nodes: [], edges: [] };

export function parseGraphSnapshot(value: unknown): GraphSnapshot {
  return graphSnapshotSchema.catch(emptyGraph).parse(value);
}

export function mergeGraphSnapshots(current: unknown, incoming: unknown): GraphSnapshot {
  const base = parseGraphSnapshot(current);
  const next = parseGraphSnapshot(incoming);
  const nodes = new Map<string, GraphNode>();

  for (const node of [...base.nodes, ...next.nodes]) {
    const stableId = node.id || toStableId(`${node.label}_${node.name}`);
    const existing = nodes.get(stableId);
    if (!existing) {
      nodes.set(stableId, { ...node, id: stableId });
      continue;
    }

    nodes.set(stableId, {
      ...existing,
      ...node,
      vulnerabilityScore: Math.max(existing.vulnerabilityScore, node.vulnerabilityScore),
      confidence: Math.max(existing.confidence, node.confidence),
      sourceArtifactIds: Array.from(new Set([...existing.sourceArtifactIds, ...node.sourceArtifactIds])),
      attributes: { ...existing.attributes, ...node.attributes }
    });
  }

  const edges = new Map<string, GraphEdge>();
  for (const edge of [...base.edges, ...next.edges]) {
    const key = `${edge.source}->${edge.target}:${edge.type}`;
    const existing = edges.get(key);
    if (!existing) {
      edges.set(key, edge);
      continue;
    }
    edges.set(key, {
      ...existing,
      confidence: Math.max(existing.confidence, edge.confidence),
      sourceArtifactIds: Array.from(new Set([...existing.sourceArtifactIds, ...edge.sourceArtifactIds]))
    });
  }

  return { nodes: Array.from(nodes.values()), edges: Array.from(edges.values()) };
}

export function calculateRiskScore(snapshot: GraphSnapshot) {
  if (snapshot.nodes.length === 0) return 0;
  const total = snapshot.nodes.reduce((sum, node) => sum + node.vulnerabilityScore, 0);
  return Math.round((total / snapshot.nodes.length) * 10) / 10;
}
