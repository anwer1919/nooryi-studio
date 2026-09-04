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
      select: { id: true }
    })

    if (!artist) {
      return NextResponse.json({ error: "الفنان غير موجود" }, { status: 404 })
    }

    const regions = await prisma.pricingRegion.findMany({
      where: { artistId: artist.id },
      orderBy: { regionName: "asc" }
    })

    return NextResponse.json(regions)
  } catch (error: any) {
    console.error("Pricing Regions API Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}