import type { GraphSnapshot } from "@/types/graph";

const colors = {
  BusinessProcess: "border-sky-400 text-sky-200",
  Application: "border-cyan-400 text-cyan-200",
  SoftwareComponent: "border-violet-400 text-violet-200",
  DataAsset: "border-emerald-400 text-emerald-200",
  CryptoAsset: "border-rose-400 text-rose-200",
  ExternalService: "border-amber-400 text-amber-200"
};

export function RiskGraph({ graph }: { graph: GraphSnapshot }) {
  if (graph.nodes.length === 0) {
    return <div className="border border-dashed border-[#1f2d44] p-8 text-sm text-slate-500">No graph entities extracted yet.</div>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {graph.nodes.map((node) => (
          <div key={node.id} className={`border bg-[#030712] p-4 ${colors[node.label]}`}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-70">{node.label}</p>
                <h3 className="mt-1 text-sm font-semibold text-slate-100">{node.name}</h3>
              </div>
              <span className="font-mono text-lg">{node.vulnerabilityScore.toFixed(1)}</span>
            </div>
            <p className="text-xs text-slate-500">Confidence {(node.confidence * 100).toFixed(0)}%</p>
          </div>
        ))}
      </div>
      <div className="border border-[#1f2d44] bg-[#030712] p-4">
        <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-[#00f0ff]">Topology Edges</h3>
        <div className="space-y-2">
          {graph.edges.length === 0 ? (
            <p className="text-xs text-slate-500">No relationships extracted.</p>
          ) : (
            graph.edges.map((edge) => (
              <div key={`${edge.source}-${edge.target}-${edge.type}`} className="border border-[#1f2d44] p-3 text-xs text-slate-400">
                <span className="text-slate-200">{edge.source}</span>
                <span className="mx-2 text-[#00f0ff]">{edge.type}</span>
                <span className="text-slate-200">{edge.target}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
