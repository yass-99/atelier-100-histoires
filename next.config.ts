import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.18"],
  experimental: {
    // Active l'intégration React <ViewTransition> (morph photo carte→fiche,
    // slides directionnels). Cf. design-system/MASTER.md § Motion.
    viewTransition: true,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
