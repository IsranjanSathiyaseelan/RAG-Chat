import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for the Docker production image to run as a minimal standalone bundle
  output: "standalone",
};

export default nextConfig;
