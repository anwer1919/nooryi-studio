import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: false, // مهم جداً لحل خطأ #441
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig