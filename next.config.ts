import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.100.88"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.snnpathome.com",
      },
    ],
  },
};

export default nextConfig;
