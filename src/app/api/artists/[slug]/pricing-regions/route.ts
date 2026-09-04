import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// ═══════════════════════════════════════════════════
// GET - جلب جميع مناطق التسعير لفنان
// ═══════════════════════════════════════════════════
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    console.log(`🔍 [GET pricing-regions] Slug: ${slug}`)

    const artist = await prisma.artist.findUnique({
      where: { slug },
      select: { id: true, name: true }
    })

    if (!artist) {
      console.log("❌ [GET] Artist not found")
      return NextResponse.json({ error: "الفنان غير موجود" }, { status: 404 })
    }

    const regions = await prisma.pricingRegion.findMany({
      where: { artistId: artist.id },
      orderBy: { regionName: "asc" }
    })

    console.log(`✅ [GET] Found ${regions.length} regions`)
    return NextResponse.json(regions)
  } catch (error: any) {
    console.error("❌ [GET] Error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════
// POST - إضافة منطقة تسعير جديدة
// ═══════════════════════════════════════════════════
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    console.log(`📝 [POST pricing-regions] Slug: ${slug}`)

    // التحقق من المصادقة
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.log("❌ [POST] Unauthorized")
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const userRole = (session.user as any).role || "USER"
    const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
    if (!isAdmin) {
      console.log("❌ [POST] Forbidden")
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
    }

    // قراءة البيانات
    let body: any
    try {
      body = await request.json()
    } catch {
      console.log("❌ [POST] Invalid JSON")
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 })
    }

    const { regionName, basePrice, travelFee } = body
    console.log("📦 [POST] Data:", { regionName, basePrice, travelFee })

    // التحقق من البيانات المطلوبة
    if (!regionName || regionName.trim() === "") {
      return NextResponse.json({ error: "اسم المنطقة مطلوب" }, { status: 400 })
    }

    const parsedBasePrice = parseFloat(String(basePrice))
    if (isNaN(parsedBasePrice) || parsedBasePrice < 0) {
      return NextResponse.json({ error: "السعر الأساسي غير صالح" }, { status: 400 })
    }

    const parsedTravelFee = parseFloat(String(travelFee || 0)) || 0

    // البحث عن الفنان
    const artist = await prisma.artist.findUnique({
      where: { slug },
      select: { id: true, name: true }
    })

    if (!artist) {
      console.log("❌ [POST] Artist not found")
      return NextResponse.json({ error: "الفنان غير موجود" }, { status: 404 })
    }

    // التحقق من عدم تكرار اسم المنطقة لنفس الفنان
    const existing = await prisma.pricingRegion.findFirst({
      where: {
        artistId: artist.id,
        regionName: { equals: regionName.trim(), mode: "insensitive" }
      }
    })

    if (existing) {
      console.log("⚠️ [POST] Region already exists")
      return NextResponse.json(
        { error: `المنطقة "${regionName}" موجودة بالفعل` },
        { status: 400 }
      )
    }

    // إنشاء المنطقة
    const region = await prisma.pricingRegion.create({
      data: {
        artistId: artist.id,
        regionName: regionName.trim(),
        basePrice: parsedBasePrice,
        travelFee: parsedTravelFee,
      }
    })

    console.log(`✅ [POST] Region created: ${region.id}`)
    return NextResponse.json({ success: true, data: region })
  } catch (error: any) {
    console.error("❌ [POST] Error:", error)
    
    // معالجة أخطاء Prisma الشائعة
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "هذه المنطقة موجودة بالفعل" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || "فشل في إضافة المنطقة" },
      { status: 500 }
    )
  }
}