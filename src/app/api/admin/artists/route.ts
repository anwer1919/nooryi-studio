import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - جلب جميع الفنانين
export async function GET() {
  try {
    // التحقق من المصادقة (اختياري للقراءة)
    const session = await getServerSession(authOptions)
    
    // جلب جميع الفنانين
    const artists = await prisma.artist.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { bookings: true, reviews: true }
        }
      }
    })

    console.log("✅ [API] Artists fetched:", artists.length)
    
    // إرجاع البيانات مباشرة كمصفوفة (للحصول على توافق أفضل)
    return NextResponse.json(artists)
  } catch (error: any) {
    console.error("❌ [API] Error:", error.message)
    return NextResponse.json(
      { error: error.message || "حدث خطأ" },
      { status: 500 }
    )
  }
}

// POST - إضافة فنان جديد
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const userRole = session.user.role || "USER"
    const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"

    if (!isAdmin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
    }

    const body = await request.json()

    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: "الاسم والـ slug مطلوبان" },
        { status: 400 }
      )
    }

    const existingArtist = await prisma.artist.findUnique({
      where: { slug: body.slug }
    })

    if (existingArtist) {
      return NextResponse.json(
        { error: "هذا الرابط مستخدم بالفعل، اختر رابط آخر" },
        { status: 400 }
      )
    }

    const newArtist = await prisma.artist.create({
      data: {
        name: body.name,
        slug: body.slug,
        category: body.category || null,
        bio: body.bio || null,
        profileImage: body.profileImage || null,
        coverImage: body.coverImage || null,
        accentColor: body.accentColor || "#D4AF37",
        status: body.status || "PENDING",
        commissionRate: body.commissionRate || 15,
        commissionDiscountVal: body.commissionDiscountVal || 0,
        bankName: body.bankName || null,
        bankAccount: body.bankAccount || null,
        iban: body.iban || null,
        vodafoneCash: body.vodafoneCash || null,
        instaPay: body.instaPay || null,
        paymentNote: body.paymentNote || null,
      },
    })

    return NextResponse.json({ success: true, data: newArtist })
  } catch (error: any) {
    console.error("Create artist error:", error)
    return NextResponse.json(
      { error: error.message || "فشل في إضافة الفنان" },
      { status: 500 }
    )
  }
}