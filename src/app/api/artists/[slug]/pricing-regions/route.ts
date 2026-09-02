import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET - جلب جميع مناطق التسعير (يعمل للعملاء والأدمن)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    console.log("🔍 Fetching pricing regions for slug:", slug)

    // البحث عن الفنان بـ slug أو id
    let artist = await prisma.artist.findUnique({ where: { slug } })
    if (!artist) {
      artist = await prisma.artist.findUnique({ where: { id: slug } })
    }
    
    if (!artist) {
      console.log("❌ Artist not found for slug:", slug)
      return NextResponse.json(
        { success: false, error: "الفنان غير موجود" },
        { status: 404 }
      )
    }

    console.log("✅ Found artist:", artist.id, artist.name)

    // جلب المناطق
    const regions = await prisma.pricingRegion.findMany({
      where: { artistId: artist.id },
      orderBy: { regionName: "asc" },
    })

    console.log(`✅ Found ${regions.length} pricing regions`)
    console.log("📋 Regions:", regions.map(r => `${r.regionName}: ${r.basePrice} + ${r.travelFee}`))

    return NextResponse.json({ 
      success: true, 
      data: regions,
      count: regions.length 
    })
  } catch (error: any) {
    console.error("❌ Error fetching pricing regions:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - إضافة منطقة تسعير جديدة (يستخدمه الأدمن)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 })
    }

    const { slug } = await params
    const body = await request.json()
    const { regionName, basePrice, travelFee } = body

    console.log("📝 Creating pricing region:", { slug, regionName, basePrice, travelFee })

    if (!regionName || basePrice === undefined) {
      return NextResponse.json(
        { success: false, error: "اسم المنطقة والسعر مطلوبان" },
        { status: 400 }
      )
    }

    // البحث عن الفنان
    let artist = await prisma.artist.findUnique({ where: { slug } })
    if (!artist) {
      artist = await prisma.artist.findUnique({ where: { id: slug } })
    }
    
    if (!artist) {
      return NextResponse.json(
        { success: false, error: "الفنان غير موجود" },
        { status: 404 }
      )
    }

    // التحقق من عدم تكرار المنطقة
    const existing = await prisma.pricingRegion.findFirst({
      where: {
        artistId: artist.id,
        regionName: { equals: regionName, mode: "insensitive" },
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: "هذه المنطقة موجودة بالفعل" },
        { status: 400 }
      )
    }

    // إنشاء المنطقة
    const region = await prisma.pricingRegion.create({
      data: {
        artistId: artist.id,
        regionName,
        basePrice: parseFloat(basePrice),
        travelFee: parseFloat(travelFee) || 0,
      },
    })

    console.log("✅ Region created:", region)

    return NextResponse.json({ success: true, data: region })
  } catch (error: any) {
    console.error("❌ Error creating pricing region:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}