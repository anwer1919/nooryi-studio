import { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic" // ✅ إجبار التشغيل الديناميكي (Runtime فقط)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "https://nooryi-studio.vercel.app"
  
  // الصفحات الثابتة
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/artists`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ]

  // ✅ حماية بـ try-catch لمنع فشل البناء
  let artistPages: MetadataRoute.Sitemap = []
  try {
    const artists = await prisma.artist.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    })

    artistPages = artists.map((artist) => ({
      url: `${baseUrl}/artists/${artist.slug}`,
      lastModified: artist.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }))
  } catch (error) {
    console.warn("⚠️ Could not fetch artists for sitemap:", error)
    // في حالة الفشل، نرجع فقط الصفحات الثابتة
  }

  return [...staticPages, ...artistPages]
}