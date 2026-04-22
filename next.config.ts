import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbo: {
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js"],
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

export default nextConfig;
