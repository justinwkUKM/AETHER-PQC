import { Terminal } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { auth } from "@/server/auth";

import GoogleSignInButton from "./GoogleSignInButton";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  const googleAuthEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    <main className="aether-shell min-h-screen px-4 py-6 lg:px-6">
      <div className="fixed right-4 top-4 z-40">
        <ThemeToggle />
      </div>
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1500px] items-center gap-8 lg:grid-cols-[1.1fr_minmax(380px,0.9fr)]">
        <section className="aether-fade-up space-y-8 py-8 lg:pr-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#32e6ff]/35 bg-[#08111f]">
              <Terminal className="h-5 w-5 text-[#32e6ff]" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#32e6ff]">AETHER-PQC</p>
              <h1 className="aether-title mt-1 text-xl font-semibold text-slate-50">Post-quantum migration workspace</h1>
            </div>
          </div>

          <div className="max-w-3xl space-y-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-slate-500">Assess crypto exposure. Track remediation. Keep the surface clean.</p>
            <h2 className="aether-title text-5xl font-semibold leading-[1.05] text-slate-50 lg:text-7xl">
              A calm, focused workspace for quantum-risk review.
            </h2>
            <p className="max-w-2xl text-base leading-8 text-slate-300 lg:text-lg">
              Upload evidence, inspect the extracted risk graph, and turn every finding into a concrete migration plan without losing
              the thread across scans.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {["Deterministic-first parsing", "Gemini multimodal analysis", "Risk graph + remediation queue", "Docker local workflow"].map((item) => (
              <span key={item} className="aether-chip rounded-full px-4 py-2 text-sm text-slate-300">
                {item}
              </span>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <FeatureStat label="Input modes" value="8" detail="JSON, CSV, PDF, images, text, markdown" />
            <FeatureStat label="Analysis" value="Hybrid" detail="Deterministic + Gemini multimodal" />
            <FeatureStat label="Outcome" value="PQC plan" detail="Prioritized remediations for migration" />
          </div>
        </section>

        <section className="aether-panel aether-fade-up w-full max-w-xl justify-self-end overflow-hidden rounded-lg">
          <div className="border-b border-white/10 px-6 py-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#32e6ff]">Sign in</p>
            <h2 className="aether-title mt-2 text-2xl font-semibold text-slate-50">Enter the workspace</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Use Google OAuth for real sessions or test auth for local development.</p>
          </div>
          <div className="space-y-5 px-6 py-6">
            {googleAuthEnabled ? (
              <GoogleSignInButton />
            ) : (
              <div className="rounded-lg border border-white/10 bg-[#08111f] px-4 py-4">
                <p className="text-sm font-medium text-slate-100">Google OAuth is not configured in this environment.</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">Use the local test session or add OAuth credentials in `.env.local`.</p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-white/10 bg-[#08111f] px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Security</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">Server-side ownership checks and sanitized artifact storage.</p>
              </div>
              <div className="rounded-md border border-white/10 bg-[#08111f] px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">AI</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">Gemini Developer API multimodal extraction for docs, PDFs, and images.</p>
              </div>
            </div>

            {process.env.TEST_AUTH_ENABLED === "true" ? (
              <Link href="/dashboard" className="aether-button aether-button-secondary w-full px-4 py-3 text-sm">
                Open test session
              </Link>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureStat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="aether-card rounded-lg px-4 py-4">
      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 font-mono text-xl text-slate-50">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
    </div>
  );
}
