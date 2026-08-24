import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // فك تشفير الـ slug لو كان URL encoded
    let decodedSlug = slug
    try {
      decodedSlug = decodeURIComponent(slug)
    } catch (e) {
      // لو فك التشفير فشل، استخدم الـ slug الأصلي
    }
    
    console.log(`🔍 Looking for artist: "${decodedSlug}"`)

    // البحث عن الفنان - بدون أي مصادقة (صفحة عامة)
    const artist = await prisma.artist.findFirst({
      where: {
        status: "ACTIVE", // فقط الفنانين النشطين للزوار
        OR: [
          { slug: { equals: decodedSlug, mode: "insensitive" } },
          { slug: { equals: slug, mode: "insensitive" } },
        ]
      },
      include: {
        availability: {
          where: {
            date: {
              gte: new Date(),
              lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            },
          },
          orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
        },
        reviews: {
          where: { isApproved: true },
          select: { rating: true }
        }
      }
    })

    if (!artist) {
      console.log(`❌ Artist not found: "${decodedSlug}"`)
      
      // عرض كل الـ slugs المتاحة للمساعدة في الـ debug
      const allArtists = await prisma.artist.findMany({
        where: { status: "ACTIVE" },
        select: { slug: true, name: true }
      })
      
      console.log("📋 Available active artists:")
      allArtists.forEach(a => {
        console.log(`   - "${a.name}" → slug: "${a.slug}"`)
      })
      
      return NextResponse.json(
        { 
          error: "Artist not found",
          searchedSlug: decodedSlug,
          availableArtists: allArtists,
        }, 
        { status: 404 }
      )
    }

    console.log(`✅ Found artist: ${artist.name} (${artist.status})`)

    // حساب متوسط التقييم
    const totalReviews = artist.reviews.length
    const averageRating = totalReviews > 0
      ? artist.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

    const { reviews, availability, ...artistData } = artist
    
    return NextResponse.json({
      ...artistData,
      rating: Math.round(averageRating * 10) / 10,
      reviewCount: totalReviews,
      availability: availability.map(a => ({
        id: a.id,
        date: a.date.toISOString(),
        timeSlot: a.timeSlot,
        status: a.status,
      })),
    })
  } catch (error: any) {
    console.error("❌ Artist API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}