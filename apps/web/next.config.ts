import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/B-Link',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
