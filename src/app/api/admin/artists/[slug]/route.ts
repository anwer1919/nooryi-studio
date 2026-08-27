import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    let decodedSlug = slug
    try {
      decodedSlug = decodeURIComponent(slug)
    } catch (e) {
      // استخدم الـ slug الأصلي لو فشل فك التشفير
    }
    
    console.log(`🔍 Looking for artist: "${decodedSlug}"`)

    const artist = await prisma.artist.findFirst({
      where: {
        status: "ACTIVE",
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
          where: {},
          select: { rating: true }
        },
        pricing: {
          orderBy: { governorate: "asc" }
        }
      }
    })

    if (!artist) {
      console.log(`❌ Artist not found: "${decodedSlug}"`)
      
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

    const totalReviews = artist.reviews.length
    const averageRating = totalReviews > 0
      ? artist.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

    const { reviews, availability, pricing, ...artistData } = artist
    
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
      pricing: pricing.map(p => ({
        id: p.id,
        governorate: p.governorate,
        basePrice: p.basePrice,
        transportationFee: p.transportationFee,
      })),
    })
  } catch (error: any) {
    console.error("❌ Artist API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}