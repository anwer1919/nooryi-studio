import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const decodedSlug = decodeURIComponent(slug)

    const artist = await prisma.artist.findFirst({
      where: { slug: { equals: decodedSlug, mode: "insensitive" } },
      select: { id: true }
    })

    if (!artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 })
    }

    // جلب التقييمات المعتمدة فقط
    const reviews = await prisma.review.findMany({
      where: { 
        artistId: artist.id,
        isApproved: true,
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

    // حساب الإحصائيات
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

    // توزيع التقييمات (كم تقييم 5 نجوم، 4 نجوم، إلخ)
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
    console.error("❌ Reviews fetch error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}