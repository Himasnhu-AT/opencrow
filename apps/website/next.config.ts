import { withContentlayer } from "next-contentlayer2";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["lucide-react"],
  turbopack: {},
  webpack: (config) => {
    return config;
  },
};

export default withContentlayer(nextConfig);
