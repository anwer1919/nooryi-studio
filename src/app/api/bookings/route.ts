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
      return NextResponse.json({ error: "الفنان غير موجود" }, { status: 404 })
    }

    // 5. التحقق من وجود المكان أو إنشاؤه
    let venue = null
    
    if (venueId) {
      try {
        venue = await prisma.venue.findUnique({
          where: { id: venueId },
        })
      } catch (err) {
        console.warn("⚠️ فشل البحث عن المكان:", err)
      }
    }

    if (!venue) {
      console.log("⚠️ المكان غير موجود، إنشاء مكان افتراضي...")
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
        return NextResponse.json({ error: "المكان غير موجود" }, { status: 404 })
      }
    }

    // 6. البحث عن العميل أو إنشاؤه
    let customer = null
    try {
      if (clientEmail) {
        customer = await prisma.customer.findFirst({
          where: { email: clientEmail },
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
            email: clientEmail || null,
          },
        })
        console.log("✅ تم إنشاء عميل جديد:", customer.id)
      } else {
        console.log("✅ العميل موجود:", customer.id)
      }
    } catch (error) {
      console.error("❌ خطأ في التعامل مع العميل:", error)
      return NextResponse.json({ error: "خطأ في بيانات العميل" }, { status: 500 })
    }

    // 7. حساب المبالغ
    const finalGrossAmount = grossAmount || 5000
    const finalDepositAmount = depositAmount || Math.round(finalGrossAmount * 0.2)
    const remainingAmount = finalGrossAmount - finalDepositAmount
    const finalTravelFee = travelFee || 0

    console.log("💰 المبالغ:", { 
      grossAmount: finalGrossAmount, 
      depositAmount: finalDepositAmount, 
      remainingAmount,
      travelFee: finalTravelFee,
      countryCode: countryCode || "+20",
      region: region || "غير محدد"
    })

    // 8. البحث عن userId
    let userId = null
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      })
      if (user) {
        userId = user.id
        console.log("✅ تم العثور على المستخدم:", userId)
      }
    } catch (error) {
      console.warn("⚠️ لم يتم العثور على المستخدم:", error)
    }

    // 9. إنشاء الحجز
    let booking
    try {
      booking = await prisma.booking.create({
        data: {
          artistId,
          venueId,
          clientName,
          clientPhone,
          clientEmail,
          date: new Date(date),
          timeSlot,
          grossAmount: finalGrossAmount,
          depositAmount: finalDepositAmount,
          // ✅ الحقول الجديدة للأرقام الدولية والتسعير حسب المنطقة
          countryCode: countryCode || "+20",
          phoneNumber: phoneNumber || "",
          region: region || "",
          travelFee: finalTravelFee,
          customerId: customer?.id || null,
          userId: userId,
        },
        include: {
          artist: true,
          venue: true,
          customer: true,
        },
      })
      console.log("✅ تم إنشاء الحجز بنجاح:", booking.id)
    } catch (error: any) {
      console.error("❌ خطأ في إنشاء الحجز:", error)
      console.error("تفاصيل الخطأ:", error.message)
      return NextResponse.json(
        { error: "خطأ في إنشاء الحجز: " + error.message },
        { status: 500 }
      )
    }

    // 10. إنشاء إشعار للأدمن
    try {
      const admins = await prisma.user.findMany({
        where: {
          role: { in: ["SUPER_ADMIN", "ADMIN"] },
        },
        select: { id: true, email: true },
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
      message: "تم إرسال طلب الحجز بنجاح!",
      booking: {
        id: booking.id,
        artistName: booking.artist?.name,
        date: booking.date,
        timeSlot: booking.timeSlot,
        status: booking.status,
        grossAmount: booking.grossAmount,
        depositAmount: booking.depositAmount,
        region: booking.region,
        countryCode: booking.countryCode,
      },
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