import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AETHER-PQC",
  description: "Post-quantum cryptographic risk assessment workspace"
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
        {children}
      </body>
    </html>
  );
}
