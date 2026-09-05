import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// ✅ POST - إنشاء حجز جديد
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    console.log("=== بدء عملية الحجز ===")
    console.log("Session:", session?.user?.email || "غير مسجل")

    // 1. التحقق من تسجيل الدخول
    if (!session?.user?.email) {
      console.error("❌ المستخدم غير مسجل دخول")
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 }
      )
    }

    // 2. قراءة البيانات
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error("❌ خطأ في قراءة JSON:", error)
      return NextResponse.json(
        { error: "بيانات غير صحيحة" },
        { status: 400 }
      )
    }

    console.log("📥 البيانات المستلمة:", JSON.stringify(body, null, 2))

    const {
      artistId,
      venueId,
      clientName,
      clientPhone,
      countryCode,
      phoneNumber,
      region,
      clientEmail,
      date,
      timeSlot,
      grossAmount = 5000,
      depositAmount,
      travelFee = 0,
    } = body

    // 3. التحقق من الحقول المطلوبة
    if (!artistId || !clientName || !clientPhone || !date || !timeSlot) {
      console.error("❌ حقول ناقصة:", { artistId, venueId, clientName, clientPhone, date, timeSlot })
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
      console.error("❌ الفنان غير موجود:", artistId)
      return NextResponse.json({
        success: true,
        id: booking.id,
        bookingId: booking.id,
        status: booking.status,
        message: "تم إرسال الحجز بنجاح — سيتم المراجعة خلال دقائق"
      })

      console.log(`📨 إرسال إشعار لـ ${admins.length} أدمن`)

      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: "حجز جديد! 🎵",
            message: `حجز جديد للفنان ${artist.name} من ${clientName} بقيمة ${finalGrossAmount.toLocaleString()} ج.م${region ? ` في ${region}` : ""}`,
            type: "new_booking",
            link: `/admin/bookings/${booking.id}`,
          },
        })
      }
      console.log("✅ تم إرسال الإشعارات بنجاح")
    } catch (error) {
      console.error("⚠️ خطأ في إرسال الإشعار:", error)
    }

    // 11. إرجاع النتيجة
    return NextResponse.json({
        success: true,
        id: booking.id,
        bookingId: booking.id,
        status: booking.status,
        message: "تم إرسال الحجز بنجاح — سيتم المراجعة خلال دقائق"
      })
  } catch (error: any) {
    console.error("❌ خطأ غير متوقع:", error)
    console.error("Stack:", error.stack)
    return NextResponse.json(
      { error: "حدث خطأ في الخادم: " + error.message },
      { status: 500 }
    )
  }
}

// ✅ GET - جلب قائمة الحجوزات
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const where: any = {}
    if (status && status !== "all") {
      where.status = status
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        artist: { select: { name: true, slug: true, profileImage: true } },
        venue: { select: { name: true } },
        customer: true,
      },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}