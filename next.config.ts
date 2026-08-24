import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // تحسين الصور
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  
  // تحسين الأداء
  compress: true,
  poweredByHeader: false,
}

export default nextConfig