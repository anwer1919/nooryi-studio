import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // تعطيل TypeScript checking في البناء
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // تعطيل ESLint في البناء
  eslint: {
    ignoreDuringBuilds: true,
  },

  // تعطيل Strict Mode لحل مشاكل Hydration
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

  // إعدادات إضافية
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

export default nextConfig