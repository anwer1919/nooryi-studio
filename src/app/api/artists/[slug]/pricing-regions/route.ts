import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// ✅ GET عام (بدون مصادقة) - للعملاء لعرض الأسعار
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    let artist = await prisma.artist.findUnique({ where: { slug } })
    if (!artist) {
      artist = await prisma.artist.findUnique({ where: { id: slug } })
    }
    if (!artist) {
      return NextResponse.json({ error: "الفنان غير موجود" }, { status: 404 })
    }

    const regions = await prisma.pricingRegion.findMany({
      where: { artistId: artist.id },
      orderBy: { regionName: "asc" },
    })

    return NextResponse.json({ success: true, data: regions })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}