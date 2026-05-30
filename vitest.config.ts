import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    exclude: ["node_modules", "tests/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 60,
        statements: 80
      },
      include: [
        "src/lib/graph.ts",
        "src/lib/ids.ts",
        "src/lib/parsing/**/*.ts",
        "src/lib/remediation/**/*.ts",
        "src/lib/storage/**/*.ts",
        "src/lib/ai/schemas.ts"
      ]
    }
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname
    }
  }
});
