import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET - جلب جميع الفنانين النشطين (بدون session)
export async function GET() {
  try {
    console.log("🎨 [Public API] Fetching all artists...")
    
    const artists = await prisma.artist.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { bookings: true, reviews: true }
        }
      }
    })

    console.log(`✅ [Public API] Found ${artists.length} artists`)
    
    return NextResponse.json(artists)
  } catch (error: any) {
    console.error("❌ [Public API] Error:", error.message)
    return NextResponse.json(
      { error: error.message || "حدث خطأ" },
      { status: 500 }
    )
  }
}