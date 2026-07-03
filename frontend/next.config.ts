import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle (.next/standalone) so the Docker
  // runtime image can be small and dependency-free.
  output: "standalone",
};

export default nextConfig;
