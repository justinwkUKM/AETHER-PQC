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
    return <div className="rounded-lg border border-dashed border-white/12 bg-white/3 p-8 text-sm leading-7 text-slate-400">No graph entities extracted yet.</div>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {graph.nodes.map((node) => (
          <div key={node.id} className={`rounded-lg border bg-[#08111f] p-4 ${colors[node.label]}`}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] opacity-70">{node.label}</p>
                <h3 className="mt-2 text-sm font-semibold text-slate-50">{node.name}</h3>
              </div>
              <span className="font-mono text-xl">{node.vulnerabilityScore.toFixed(1)}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,rgba(50,230,255,0.75),rgba(255,107,135,0.8))]" style={{ width: `${Math.max(10, node.vulnerabilityScore * 10)}%` }} />
            </div>
            <p className="mt-3 text-xs text-slate-500">Confidence {(node.confidence * 100).toFixed(0)}%</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-white/10 bg-[#08111f] p-4">
        <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-[#32e6ff]">Topology edges</h3>
        <div className="space-y-2">
          {graph.edges.length === 0 ? (
            <p className="text-xs leading-6 text-slate-500">No relationships extracted.</p>
          ) : (
            graph.edges.map((edge) => (
              <div key={`${edge.source}-${edge.target}-${edge.type}`} className="rounded-md border border-white/10 bg-[#050a14] p-3 text-xs text-slate-400">
                <span className="text-slate-100">{edge.source}</span>
                <span className="mx-2 text-[#32e6ff]">{edge.type}</span>
                <span className="text-slate-100">{edge.target}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
