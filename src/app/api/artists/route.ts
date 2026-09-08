import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getManagerContext, artistWhere } from "@/lib/managerFilter"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const mgr = await getManagerContext()

    const artists = await prisma.artist.findMany({
      where: { ...artistWhere(mgr), status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { bookings: true, reviews: true },
        },
      },
    })

    return NextResponse.json(artists, {
      status: 200,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    })
  } catch (error: any) {
    console.error("[API /api/artists] Error:", error.message)
    return NextResponse.json([], { status: 200 })
  }
}