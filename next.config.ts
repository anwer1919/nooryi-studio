import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  telemetry: false,
  // تعطيل TypeScript checking
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // تعطيل Strict Mode لحل React #441
  reactStrictMode: false,
  
  // إعدادات الصور
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

export default nextConfig