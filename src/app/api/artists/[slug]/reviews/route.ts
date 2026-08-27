import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // ?? ????? ??? slug
    let decodedSlug = slug
    try {
      decodedSlug = decodeURIComponent(slug)
    } catch (e) {
      // ?? ?? ??????? ???? ?????? ??? slug ??????
    }
    
    console.log(`? Fetching reviews for artist: "${decodedSlug}"`)

    // ????? ?? ??????
    const artist = await prisma.artist.findFirst({
      where: {
        slug: { equals: decodedSlug, mode: "insensitive" },
      },
      select: { id: true }
    })

    if (!artist) {
      console.log(`? Artist not found: "${decodedSlug}"`)
      return NextResponse.json(
        { error: "Artist not found" }, 
        { status: 404 }
      )
    }

    // ??? ????????? ???????? ???
    const reviews = await prisma.review.findMany({
      where: { 
        artistId: artist.id,
        },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        comment: true,
        clientName: true,
        createdAt: true,
      }
    })

    console.log(`? Found ${reviews.length} review(s)`)

    // ???? ??????????
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

    // ????? ????????? (?? ????? 5 ????? 4 ????? ???)
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    }

    return NextResponse.json({
      reviews,
      stats: {
        total: totalReviews,
        average: Math.round(averageRating * 10) / 10,
        distribution: ratingDistribution,
      }
    })
  } catch (error: any) {
    console.error("? Reviews API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}