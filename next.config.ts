import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "pdf-parse"],
  experimental: {
    serverActions: {
      bodySizeLimit: "30mb"
    }
  }
};

export default nextConfig;
