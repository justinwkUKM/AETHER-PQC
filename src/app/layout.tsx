import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AETHER // PQC Core System",
  description: "Post-quantum cryptographic assessment protocol"
};

const themeScript = `
(() => {
  try {
    const stored = localStorage.getItem("aether-theme");
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const theme = stored === "light" || stored === "dark" ? stored : prefersLight ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
  } catch {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.classList.add("dark");
  }
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" data-theme="dark" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script id="aether-theme-init" dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-[var(--bg-deep)] text-[var(--text-primary)] antialiased">
        <div className="aether-crt pointer-events-none fixed inset-0 z-50 opacity-[0.015] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
        {children}
      </body>
    </html>
  );
}
