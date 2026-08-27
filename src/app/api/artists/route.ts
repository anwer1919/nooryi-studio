import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    // بناء شروط البحث
    const where: any = {
      status: "ACTIVE",
    }

    if (category && category !== "الكل" && category !== "all") {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ]
    }

    const artists = await prisma.artist.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        bio: true,
        profileImage: true,
        coverImage: true,
        accentColor: true,
        status: true,
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    })

    // حساب متوسط التقييم لكل فنان
    const artistsWithRatings = artists.map((artist) => {
      const ratings = artist.reviews.map((r) => r.rating)
      const avgRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
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
        status: artist.status,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: artist._count.reviews,
        bookingCount: artist._count.bookings,
      }
    })

    return NextResponse.json(artistsWithRatings)
  } catch (error) {
    console.error("Error fetching artists:", error)
    return NextResponse.json(
      { error: "حدث خطأ في جلب الفنانين" },
      { status: 500 }
    )
  }
}