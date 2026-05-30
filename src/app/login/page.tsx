import { Terminal } from "lucide-react";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/server/auth";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="aether-panel w-full max-w-md p-8">
        <div className="mb-8 flex items-center gap-3">
          <Terminal className="h-6 w-6 text-[#00f0ff]" />
          <div>
            <h1 className="font-mono text-lg font-bold tracking-[0.2em] text-[#00f0ff]">AETHER-PQC</h1>
            <p className="text-sm text-slate-400">Secure assessment interface</p>
          </div>
        </div>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button className="w-full border border-[#00f0ff] px-4 py-3 font-mono text-sm text-[#00f0ff] hover:bg-[#00f0ff]/10">
            SIGN IN WITH GOOGLE
          </button>
        </form>
        {process.env.TEST_AUTH_ENABLED === "true" ? (
          <a href="/dashboard" className="mt-4 block text-center text-xs text-slate-500">
            Test mode active
          </a>
        ) : null}
      </section>
    </main>
  );
}
