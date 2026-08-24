import { Metadata } from "next"

interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: "website" | "article" | "profile"
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nooryi.com"
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = ["فنانين", "حجز", "حفلات", "مناسبات", "موسيقى", "Nooryi Studio"],
    image = DEFAULT_IMAGE,
    url = BASE_URL,
    type = "website",
  } = config

  const fullTitle = `${title} | Nooryi Studio`

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(", "),
    authors: [{ name: "Nooryi Studio" }],
    creator: "Nooryi Studio",
    publisher: "Nooryi Studio",
    
    // Open Graph
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: "Nooryi Studio",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "ar_EG",
      type,
    },

    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      creator: "@nooryi_studio",
    },

    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // Canonical
    alternates: {
      canonical: url,
    },

    // Other
    manifest: "/manifest.json",
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },
  }
}

// Metadata خاصة بصفحات الفنانين
export function generateArtistMetadata(artist: {
  name: string
  bio?: string | null
  category?: string | null
  profileImage?: string | null
  slug: string
}): Metadata {
  const description = artist.bio 
    ? `${artist.bio} - احجز ${artist.name} لحفلتك الخاصة مع Nooryi Studio`
    : `احجز ${artist.name}${artist.category ? ` (${artist.category})` : ""} لحفلتك الخاصة مع Nooryi Studio - منصة حجز الفنانين الأولى`

  return generateMetadata({
    title: `احجز ${artist.name}${artist.category ? ` - ${artist.category}` : ""}`,
    description,
    keywords: [
      artist.name,
      artist.category || "فنان",
      "حجز فنان",
      "حفلات",
      "مناسبات",
      "Nooryi Studio",
    ],
    image: artist.profileImage || DEFAULT_IMAGE,
    url: `${BASE_URL}/artists/${artist.slug}`,
    type: "profile",
  })
}