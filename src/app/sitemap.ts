import { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nooryi.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // الصفحات الثابتة
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/artists`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  // صفحات الفنانين الديناميكية
  let artistPages: MetadataRoute.Sitemap = []
  
  try {
    const artists = await prisma.artist.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    })

    artistPages = artists.map((artist) => ({
      url: `${BASE_URL}/artists/${artist.slug}`,
      lastModified: artist.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.error("Error fetching artists for sitemap:", error)
  }

  return [...staticPages, ...artistPages]
}