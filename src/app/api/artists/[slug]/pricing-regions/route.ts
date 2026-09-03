import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// ✅ Helper للتعامل مع أخطاء Prisma
function handlePrismaError(error: any, context: string) {
  console.error(`❌ [${context}] Prisma Error:`, {
    message: error.message,
    code: error.code,
    meta: error.meta,
    name: error.name,
  })

  // أخطاء Prisma الشائعة
  if (error.code === "P1001") {
    return { error: "لا يمكن الاتصال بقاعدة البيانات", status: 503 }
  }
  if (error.code === "P2002") {
    return { error: "هذا العنصر موجود بالفعل", status: 400 }
  }
  if (error.code === "P2025") {
    return { error: "السجل غير موجود", status: 404 }
  }
  if (error.code === "P2003") {
    return { error: "خطأ في العلاقة - تأكد من وجود الفنان", status: 400 }
  }

  return { 
    error: `خطأ في قاعدة البيانات: ${error.message}`, 
    status: 500,
    details: { code: error.code, meta: error.meta }
  }
}

// GET - جلب جميع مناطق التسعير
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    console.log("🔍 [GET] Slug:", slug)

    // ✅ التحقق من اتصال Prisma
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log("✅ [GET] Database connection OK")
    } catch (connError: any) {
      console.error("❌ [GET] Database connection failed:", connError.message)
      return NextResponse.json(
        { success: false, error: "فشل الاتصال بقاعدة البيانات" },
        { status: 503 }
      )
    }

    // البحث عن الفنان
    let artist = null
    try {
      artist = await prisma.artist.findUnique({ where: { slug } })
      if (!artist) {
        artist = await prisma.artist.findFirst({
          where: { slug: { equals: slug, mode: "insensitive" } }
        })
      }
    } catch (dbError: any) {
      const errorInfo = handlePrismaError(dbError, "GET-findArtist")
      return NextResponse.json(
        { success: false, ...errorInfo },
        { status: errorInfo.status }
      )
    }
    
    if (!artist) {
      return NextResponse.json(
        { success: false, error: "الفنان غير موجود" },
        { status: 404 }
      )
    }

    console.log("✅ [GET] Artist found:", artist.id, artist.name)

    // جلب المناطق
    const regions = await prisma.pricingRegion.findMany({
      where: { artistId: artist.id },
      orderBy: { regionName: "asc" },
    })

    console.log(`✅ [GET] Found ${regions.length} regions`)

    return NextResponse.json({ 
      success: true, 
      data: regions,
      count: regions.length,
      artistName: artist.name
    })
  } catch (error: any) {
    console.error("❌ [GET] Unexpected error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - إضافة منطقة تسعير جديدة
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    console.log("🔍 [POST] Starting region creation...")

    // ✅ التحقق من المصادقة
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.log("❌ [POST] Unauthorized")
      return NextResponse.json(
        { success: false, error: "غير مصرح" },
        { status: 401 }
      )
    }

    console.log("✅ [POST] User:", session.user.email)

    const { slug } = await params

    // ✅ قراءة البيانات
    let body: any
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: "بيانات غير صالحة" },
        { status: 400 }
      )
    }

    const { regionName, basePrice, travelFee } = body

    console.log("📝 [POST] Data:", { slug, regionName, basePrice, travelFee })

    // ✅ التحقق من البيانات المطلوبة
    if (!regionName || regionName.trim() === "") {
      return NextResponse.json(
        { success: false, error: "اسم المنطقة مطلوب" },
        { status: 400 }
      )
    }

    const parsedBasePrice = parseFloat(String(basePrice))
    if (isNaN(parsedBasePrice) || parsedBasePrice < 0) {
      return NextResponse.json(
        { success: false, error: "السعر الأساسي غير صالح" },
        { status: 400 }
      )
    }

    const parsedTravelFee = parseFloat(String(travelFee || 0))

    // ✅ التحقق من اتصال Prisma
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log("✅ [POST] Database connection OK")
    } catch (connError: any) {
      console.error("❌ [POST] Database connection failed:", connError.message)
      return NextResponse.json(
        { success: false, error: "فشل الاتصال بقاعدة البيانات" },
        { status: 503 }
      )
    }

    // ✅ البحث عن الفنان
    let artist = null
    try {
      artist = await prisma.artist.findUnique({ where: { slug } })
      if (!artist) {
        artist = await prisma.artist.findFirst({
          where: { slug: { equals: slug, mode: "insensitive" } }
        })
      }
    } catch (dbError: any) {
      const errorInfo = handlePrismaError(dbError, "POST-findArtist")
      return NextResponse.json(
        { success: false, ...errorInfo },
        { status: errorInfo.status }
      )
    }
    
    if (!artist) {
      return NextResponse.json(
        { success: false, error: "الفنان غير موجود" },
        { status: 404 }
      )
    }

    console.log("✅ [POST] Artist found:", artist.id)

    // ✅ التحقق من عدم تكرار المنطقة
    try {
      const existing = await prisma.pricingRegion.findFirst({
        where: {
          artistId: artist.id,
          regionName: { equals: regionName.trim(), mode: "insensitive" },
        },
      })

      if (existing) {
        return NextResponse.json(
          { success: false, error: "هذه المنطقة موجودة بالفعل" },
          { status: 400 }
        )
      }
    } catch (dbError: any) {
      console.error("❌ [POST] Error checking existing:", dbError.message)
    }

    // ✅ إنشاء المنطقة
    let region = null
    try {
      region = await prisma.pricingRegion.create({
        data: {
          artistId: artist.id,
          regionName: regionName.trim(),
          basePrice: parsedBasePrice,
          travelFee: isNaN(parsedTravelFee) ? 0 : parsedTravelFee,
        },
      })
    } catch (dbError: any) {
      const errorInfo = handlePrismaError(dbError, "POST-createRegion")
      return NextResponse.json(
        { success: false, ...errorInfo },
        { status: errorInfo.status }
      )
    }

    console.log("✅ [POST] Region created:", region.id, region.regionName)

    return NextResponse.json({ 
      success: true, 
      data: region,
      message: "تم إضافة المنطقة بنجاح"
    })
  } catch (error: any) {
    console.error("❌ [POST] Unexpected error:", error)
    console.error("❌ [POST] Stack:", error.stack)
    return NextResponse.json(
      { 
        success: false, 
        error: `خطأ غير متوقع: ${error.message}`,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}