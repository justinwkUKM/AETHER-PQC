import { DatabaseZap, KeyRound, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/shell";
import { CryptoInventoryWorkbench } from "@/components/project/crypto-inventory-workbench";
import { buildCryptoInventory } from "@/lib/crypto-inventory";
import { enrichGraphExposure } from "@/lib/exposure";
import { parseGraphSnapshot } from "@/lib/graph";
import { requireProject, requireUser } from "@/server/auth/guards";

export default async function CryptoInventoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const project = await requireProject(user.id, id);
  const graph = enrichGraphExposure(parseGraphSnapshot(project.graphSnapshot));
  const artifacts = project.artifacts.map((artifact) => ({
    id: artifact.id,
    name: artifact.name,
    type: artifact.type,
    parserMode: artifact.parserMode
  }));
  const inventory = buildCryptoInventory(graph, artifacts);
  const vulnerable = inventory.filter((item) => item.posture === "Vulnerable").length;
  const needsReview = inventory.filter((item) => item.reviewStatus === "Needs review").length;

  return (
    <AppShell
      user={user}
      projectId={project.id}
      projectName={project.name}
      projectRisk={project.riskScore}
      artifactCount={project.artifacts.length}
      remediationCount={project.remediations.length}
      lastScanLabel={project.lastScanAt ? project.lastScanAt.toLocaleString() : "Awaiting scan"}
    >
      <section className="aether-panel aether-fade-up rounded-lg overflow-hidden">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_minmax(260px,0.9fr)] lg:p-8">
          <div>
            <p className="text-xs font-medium text-[var(--accent-cyan)]">Cryptography inventory</p>
            <h1 className="aether-title mt-3 text-4xl font-semibold text-slate-50">{project.name}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
              Review extracted primitives, protocols, parser evidence, confidence, exposure, and migration targets before assigning PQC work.
            </p>
          </div>
          <div className="grid gap-3">
            <QuickStat label="Findings" value={inventory.length.toString()} icon={<KeyRound className="h-4 w-4" />} />
            <QuickStat label="Vulnerable" value={vulnerable.toString()} icon={<ShieldAlert className="h-4 w-4" />} />
            <QuickStat label="Needs review" value={needsReview.toString()} icon={<DatabaseZap className="h-4 w-4" />} />
          </div>
        </div>
      </section>

      <div className="mt-6">
        <CryptoInventoryWorkbench items={inventory} />
      </div>
    </AppShell>
  );
}

function QuickStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#08111f] px-4 py-4">
      <div className="flex items-center justify-between text-slate-500">
        <p className="text-xs font-medium">{label}</p>
        {icon}
      </div>
      <p className="mt-2 font-mono text-xl text-slate-50">{value}</p>
    </div>
  );
}
