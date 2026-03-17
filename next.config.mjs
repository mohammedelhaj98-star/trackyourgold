import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("next").NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  output: "standalone",
  outputFileTracingRoot: workspaceRoot,
  experimental: {
    cpus: 1
  }
};

export default nextConfig;
