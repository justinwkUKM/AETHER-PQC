"use client";

import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.classList.toggle("light", theme === "light");
  localStorage.setItem("aether-theme", theme);
}

export function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={() => {
        const theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
        const nextTheme = theme === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
      }}
      className="aether-button aether-button-secondary h-10 w-10 px-0"
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      <Sun className="theme-icon theme-icon-sun h-4 w-4" />
      <Moon className="theme-icon theme-icon-moon h-4 w-4" />
    </button>
  );
}
