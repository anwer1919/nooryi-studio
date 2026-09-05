import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// ═══════════════════════════════════════════════════
// POST - إنشاء حجز جديد
// ═══════════════════════════════════════════════════
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    console.log("=== بدء عملية الحجز ===")
    console.log("Session:", session?.user?.email || "غير مسجل")

    // 1. التحقق من تسجيل الدخول
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 }
      )
    }

    // 2. قراءة البيانات
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 })
    }

    const {
      artistId,
      venueId,
      clientName,
      clientPhone,
      clientEmail,
      date,
      timeSlot,
      grossAmount = 5000,
      depositAmount,
      travelFee = 0,
      countryCode,
      phoneNumber,
      region,
      eventType,
      notes,
    } = body

    // 3. التحقق من الحقول المطلوبة (venueId اختياري)
    if (!artistId || !clientName || !clientPhone || !date || !timeSlot) {
      return NextResponse.json(
        { error: "جميع الحقول المطلوبة يجب أن تكون موجودة" },
        { status: 400 }
      )
    }

    // 4. التحقق من وجود الفنان
    const artist = await prisma.artist.findUnique({
      where: { id: artistId },
    })

    if (!artist) {
      return NextResponse.json({ error: "الفنان غير موجود" }, { status: 404 })
    }

    // 5. معالجة المكان (اختياري)
    let venue = null
    if (venueId) {
      try {
        venue = await prisma.venue.findUnique({ where: { id: venueId } })
      } catch (err) {
        console.warn("⚠️ فشل البحث عن المكان:", err)
      }
    }

    if (!venue) {
      try {
        venue = await prisma.venue.create({
          data: {
            name: "مكان عام",
            address: "سيتم تحديده لاحقاً",
          },
        })
        console.log("✅ تم إنشاء مكان افتراضي:", venue.id)
      } catch (err) {
        console.error("❌ فشل إنشاء المكان:", err)
        return NextResponse.json({ error: "فشل إنشاء المكان" }, { status: 500 })
      }
    }

    // 6. معالجة العميل
    let customer = null
    const finalClientEmail = clientEmail || session?.user?.email || null

    try {
      if (finalClientEmail) {
        customer = await prisma.customer.findFirst({
          where: { email: finalClientEmail },
        })
      }

      if (!customer && clientPhone) {
        customer = await prisma.customer.findFirst({
          where: { phone: clientPhone },
        })
      }

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            fullName: clientName,
            phone: clientPhone,
            email: finalClientEmail,
          },
        })
        console.log("✅ تم إنشاء عميل جديد:", customer.id)
      }
    } catch (error) {
      console.error("❌ خطأ في التعامل مع العميل:", error)
    }

    // 7. ربط المستخدم المسجل
    let finalUserId = null
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      })
      if (user) finalUserId = user.id
    } catch (err) {
      console.warn("⚠️ لم يتم العثور على المستخدم:", err)
    }

    // ربط العميل بالمستخدم إذا لم يكن مربوطاً
    if (customer && finalUserId && !customer.userId) {
      try {
        await prisma.customer.update({
          where: { id: customer.id },
          data: { userId: finalUserId },
        })
      } catch (err) {
        console.warn("⚠️ فشل ربط العميل بالمستخدم:", err)
      }
    }

    // 8. حساب المبالغ
    const finalGrossAmount = parseFloat(String(grossAmount)) || 5000
    const finalDepositAmount = depositAmount 
      ? parseFloat(String(depositAmount)) 
      : Math.round(finalGrossAmount * 0.2)
    const finalTravelFee = parseFloat(String(travelFee)) || 0

    // 9. إنشاء الحجز
    let booking
    try {
      booking = await prisma.booking.create({
        data: {
          artist: { connect: { id: artistId } },
          venue: venue ? { connect: { id: venue.id } } : undefined,
          customer: customer ? { connect: { id: customer.id } } : undefined,
          userId: finalUserId,
          clientName,
          clientPhone,
          clientEmail: finalClientEmail,
          date: new Date(date),
          timeSlot,
          grossAmount: finalGrossAmount,
          depositAmount: finalDepositAmount,
          travelFee: finalTravelFee,
          status: "PENDING_APPROVAL",
          countryCode: countryCode || "+20",
          phoneNumber: phoneNumber || clientPhone,
          region: region || "",
        },
        include: {
          artist: true,
          venue: true,
          customer: true,
        },
      })
      console.log("✅ تم إنشاء الحجز بنجاح:", booking.id)
    } catch (error: any) {
      console.error("❌ خطأ في إنشاء الحجز:", error.message)
      return NextResponse.json(
        { error: "خطأ في إنشاء الحجز: " + error.message },
        { status: 500 }
      )
    }

    // 10. إرسال إشعارات (في try/catch منفصل)
    try {
      const admins = await prisma.user.findMany({
        where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
        select: { id: true, email: true },
      })

      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: "NEW_BOOKING",
            title: "حجز جديد بانتظار المراجعة",
            message: `حجز جديد من ${clientName} للفنان ${artist.name}`,
            relatedId: booking.id,
          },
        })
      }
      console.log("✅ تم إرسال الإشعارات")
    } catch (err) {
      console.warn("⚠️ خطأ في الإشعارات:", err)
    }

    // 11. إرجاع النجاح
    return NextResponse.json({
      success: true,
      id: booking.id,
      bookingId: booking.id,
      status: booking.status,
      message: "تم إرسال الحجز بنجاح — سيتم المراجعة خلال دقائق",
    })
  } catch (error: any) {
    console.error("❌ خطأ عام:", error)
    return NextResponse.json(
      { error: error.message || "حدث خطأ" },
      { status: 500 }
    )
  }
}

// ═══════════════════════════════════════════════════
// GET - جلب الحجوزات
// ═══════════════════════════════════════════════════
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const artistId = searchParams.get("artistId")

    const where: any = {}

    // الأدمن يرى كل الحجوزات، العميل يرى حجوزاته فقط
    const userRole = (session.user as any).role || "USER"
    const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"

    if (!isAdmin) {
      where.OR = [
        { clientEmail: session.user.email },
        { userId: (session.user as any).id },
      ]
    }

    if (status && status !== "all") {
      where.status = status
    }

    if (artistId) {
      where.artistId = artistId
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        artist: { select: { id: true, name: true, slug: true, profileImage: true } },
        venue: { select: { id: true, name: true, address: true, city: true } },
        customer: { select: { id: true, fullName: true, phone: true, email: true } },
      },
    })

    return NextResponse.json(bookings)
  } catch (error: any) {
    console.error("❌ خطأ في جلب الحجوزات:", error)
    return NextResponse.json({ error: error.message || "حدث خطأ" }, { status: 500 })
  }
}