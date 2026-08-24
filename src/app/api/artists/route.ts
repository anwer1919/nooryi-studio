import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const artists = await prisma.artist.findMany({
      where: {
        status: "ACTIVE",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        bio: true,
        profileImage: true,
        coverImage: true,
        accentColor: true,
        reviews: {
          where: { isApproved: true },
          select: { rating: true }
        }
      }
    })

    // حساب متوسط التقييم لكل فنان
    const artistsWithRatings = artists.map(artist => {
      const totalReviews = artist.reviews.length
      const averageRating = totalReviews > 0
        ? artist.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0
      
      return {
        id: artist.id,
        name: artist.name,
        slug: artist.slug,
        category: artist.category,
        bio: artist.bio,
        profileImage: artist.profileImage,
        coverImage: artist.coverImage,
        accentColor: artist.accentColor,
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: totalReviews,
      }
    })

    return NextResponse.json(artistsWithRatings)
  } catch (error: any) {
    console.error("❌ Artists API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}