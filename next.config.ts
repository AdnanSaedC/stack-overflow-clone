import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling node-appwrite (fixes instanceof errors)
  serverExternalPackages: ['node-appwrite'],
};

export default nextConfig;
