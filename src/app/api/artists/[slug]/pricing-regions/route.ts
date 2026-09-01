import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - جلب أسعار المناطق
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - إضافة/تحديث أسعار المناطق
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const { slug } = await params

    let artist = await prisma.artist.findUnique({ where: { slug } })
    if (!artist) {
      artist = await prisma.artist.findUnique({ where: { id: slug } })
    }

    if (!artist) {
      return NextResponse.json({ error: "الفنان غير موجود" }, { status: 404 })
    }

    const body = await request.json()
    const { regions } = body // مصفوفة من المناطق

    // حذف المناطق القديمة
    await prisma.pricingRegion.deleteMany({
      where: { artistId: artist.id },
    })

    // إنشاء المناطق الجديدة
    const newRegions = await Promise.all(
      regions.map((region: any) =>
        prisma.pricingRegion.create({
          data: {
            artistId: artist.id,
            regionName: region.regionName,
            basePrice: region.basePrice,
            travelFee: region.travelFee || 0,
          },
        })
      )
    )

    return NextResponse.json({ success: true, data: newRegions })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}