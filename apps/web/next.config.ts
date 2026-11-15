import type { NextConfig } from "next";
import { existsSync } from "fs";
import { resolve } from "path";

// The monorepo keeps a single .env at the repo root; Next.js only reads
// apps/web/.env*, so load the root file too (MONGODB_URI, AUTH_SECRET, ...).
const rootEnv = resolve(__dirname, "../../.env");
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  serverExternalPackages: ["mongoose"],
};

export default nextConfig;
