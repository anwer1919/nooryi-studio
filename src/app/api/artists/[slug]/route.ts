import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const artist = await prisma.artist.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { bookings: true, reviews: true }
        }
      }
    })

    if (!artist) {
      return NextResponse.json({ error: "الفنان غير موجود" }, { status: 404 })
    }

    return NextResponse.json(artist)
  } catch (error: any) {
    console.error("Artist API Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}