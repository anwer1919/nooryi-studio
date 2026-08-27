import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    // التحقق من تسجيل الدخول
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 }
      )
    }

    console.log("📥 بيانات الحجز المستلمة:", body)

    // التحقق من الحقول المطلوبة
    const {
      artistId,
      venueId,
      clientName,
      clientPhone,
      clientEmail,
      date,
      timeSlot,
      grossAmount,
    } = body

    if (!artistId || !venueId || !clientName || !clientPhone || !date || !timeSlot) {
      console.error("❌ حقول ناقصة:", { artistId, venueId, clientName, clientPhone, date, timeSlot })
      return NextResponse.json(
        { error: "جميع الحقول المطلوبة يجب أن تكون موجودة" },
        { status: 400 }
      )
    }

    // التحقق من وجود الفنان
    const artist = await prisma.artist.findUnique({
      where: { id: artistId },
    })

    if (!artist) {
      return NextResponse.json(
        { error: "الفنان غير موجود" },
        { status: 404 }
      )
    }

    // التحقق من وجود المكان
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
    })

    if (!venue) {
      return NextResponse.json(
        { error: "المكان غير موجود" },
        { status: 404 }
      )
    }

    // البحث عن العميل أو إنشاؤه
    let customer = await prisma.customer.findFirst({
      where: { 
        OR: [
          { email: clientEmail || "" },
          { phone: clientPhone },
        ]
      },
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          fullName: clientName,
          phone: clientPhone,
          email: clientEmail || null,
        },
      })
      console.log("✅ تم إنشاء عميل جديد:", customer.id)
    }

    // حساب المبالغ
    const depositAmount = (grossAmount || 0) * 0.2
    const remainingAmount = (grossAmount || 0) - depositAmount

    // إنشاء الحجز
    const booking = await prisma.booking.create({
      data: {
        artistId,
        customerId: customer.id,
        venueId,
        clientName,
        clientPhone,
        clientEmail: clientEmail || null,
        date: new Date(date),
        timeSlot,
        status: "PENDING_APPROVAL",
        grossAmount: grossAmount || 0,
        depositAmount,
        remainingAmount,
      },
      include: {
        artist: true,
        venue: true,
      },
    })

    console.log("✅ تم إنشاء الحجز بنجاح:", booking.id)

    // إنشاء إشعار للأدمن
    try {
      const admins = await prisma.user.findMany({
        where: {
          role: { in: ["SUPER_ADMIN", "ADMIN"] },
        },
        select: { id: true },
      })

      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: "حجز جديد! 🎵",
            message: `حجز جديد للفنان ${artist.name} من ${clientName}`,
            type: "new_booking",
            link: `/admin/bookings/${booking.id}`,
          },
        })
      }
      console.log("✅ تم إرسال إشعار للأدمنز")
    } catch (error) {
      console.error("⚠️ خطأ في إرسال الإشعار:", error)
    }

    return NextResponse.json({
      success: true,
      message: "تم إرسال طلب الحجز بنجاح! سيتم مراجعته من قبل الإدارة.",
      booking: {
        id: booking.id,
        artistName: booking.artist?.name,
        date: booking.date,
        timeSlot: booking.timeSlot,
        status: booking.status,
        grossAmount: booking.grossAmount,
        depositAmount: booking.depositAmount,
      },
    })
  } catch (error) {
    console.error("❌ خطأ في إنشاء الحجز:", error)
    return NextResponse.json(
      { error: "حدث خطأ في إنشاء الحجز. يرجى المحاولة مرة أخرى." },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        artist: { select: { name: true, slug: true } },
        venue: { select: { name: true } },
      },
    })
    return NextResponse.json(bookings)
  } catch (error) {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}