import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AETHER // PQC Core System",
  description: "Post-quantum cryptographic assessment protocol"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="min-h-screen bg-[#030712] text-slate-100 antialiased">
        <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.015] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
        {children}
      </body>
    </html>
  );
}
