import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  eslint: {
    // ONLY FOR DEMO, TODO: clean up properly
    ignoreDuringBuilds: true,
  },
} ;
