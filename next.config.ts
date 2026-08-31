import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // تعطيل telemetry لمنع خطأ startTime
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  
  // تعطيل التحذيرات المزعجة
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
}

export default nextConfig