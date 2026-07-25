import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root (a stray pnpm-lock.yaml in the home dir confuses inference).
  turbopack: {
    root: __dirname,
  },
  images: {
    // Placeholder project textures are trusted local SVGs.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
