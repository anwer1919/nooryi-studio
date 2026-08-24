import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// رقم واتساب الأدمن
const ADMIN_WHATSAPP = "249998989999"

// دالة تنسيق رسالة الواتساب
function formatWhatsAppMessage(booking: any, artistName: string, venueName: string): string {
  const timeSlotLabels: Record<string, string> = {
    MORNING: "صباحاً (9ص - 12ظ)",
    AFTERNOON: "ظهراً (12ظ - 5م)",
    EVENING: "مساءً (5م - 11م)",
  }

  const dateStr = new Date(booking.date).toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const priceInfo = booking.grossAmount
    ? `\n💰 *الإجمالي:* ${booking.grossAmount.toLocaleString()} ج.م\n💵 *العربون:* ${booking.depositAmount?.toLocaleString() || 0} ج.م`
    : ""

  return `🎵 *حجز جديد!* 🎵

━━━━━━━━━━━━━━━━
👤 *العميل:* ${booking.clientName || "غير محدد"}
📞 *الهاتف:* ${booking.clientPhone || "غير محدد"}
${booking.clientEmail ? `📧 *الإيميل:* ${booking.clientEmail}\n` : ""}🎤 *الفنان:* ${artistName}
📅 *التاريخ:* ${dateStr}
⏰ *الفترة:* ${timeSlotLabels[booking.timeSlot] || booking.timeSlot}
📍 *المكان:* ${venueName}${priceInfo}
🆔 *رقم الحجز:* ${booking.id.slice(0, 8).toUpperCase()}
━━━━━━━━━━━━━━━━

يرجى مراجعة الحجز في لوحة التحكم.
🔗 ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/bookings`
}

// دالة إرسال إشعار واتساب
async function sendWhatsAppNotification(booking: any, artistName: string, venueName: string) {
  try {
    const message = formatWhatsAppMessage(booking, artistName, venueName)
    const url = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`
    
    console.log("📱 WhatsApp notification URL:", url)
    console.log("📱 Message preview:", message.slice(0, 100) + "...")
    
    return { success: true, url, message }
  } catch (err: any) {
    console.error("❌ WhatsApp notification failed:", err.message)
    return { success: false, error: err.message }
  }
}

// GET - جلب الحجوزات
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get("phone")

    if (session?.user) {
      const userRole = (session.user as any).role
      
      if (userRole === "SUPER_ADMIN") {
        const bookings = await prisma.booking.findMany({
          orderBy: { createdAt: "desc" },
          include: {
            artist: { select: { name: true, slug: true, profileImage: true, category: true } },
            customer: { select: { fullName: true, phone: true } },
            venue: { select: { name: true, address: true } },
            review: { select: { id: true, rating: true } },
          },
        })
        return NextResponse.json(bookings)
      }

      if (userRole === "ARTIST_ADMIN") {
        const artistId = (session.user as any).artistId
        const bookings = await prisma.booking.findMany({
          where: { artistId: String(artistId) } as any,
          orderBy: { createdAt: "desc" },
          include: {
            artist: { select: { name: true, slug: true, profileImage: true, category: true } },
            customer: { select: { fullName: true, phone: true } },
            venue: { select: { name: true, address: true } },
            review: { select: { id: true, rating: true } },
          },
        })
        return NextResponse.json(bookings)
      }

      const customer = await prisma.customer.findUnique({
        where: { userId: session.user.id as string },
      })

      if (!customer) {
        return NextResponse.json([])
      }

      const bookings = await prisma.booking.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: "desc" },
        include: {
          artist: { select: { name: true, slug: true, profileImage: true, category: true } },
          venue: { select: { name: true, address: true } },
          review: { select: { id: true, rating: true } },
        },
      })

      return NextResponse.json(bookings)
    }

    if (!phone) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أو إدخال رقم الهاتف" },
        { status: 400 }
      )
    }

    const bookings = await prisma.booking.findMany({
      where: { clientPhone: phone },
      orderBy: { createdAt: "desc" },
      include: {
        artist: { select: { name: true, slug: true, profileImage: true, category: true } },
        venue: { select: { name: true, address: true } },
        review: { select: { id: true, rating: true } },
      },
    })

    return NextResponse.json(bookings)
  } catch (error: any) {
    console.error("❌ Bookings GET error:", error.message)
    console.error("❌ Error stack:", error.stack)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - إنشاء حجز جديد
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    console.log("📥 Booking request received:", body)

    const {
      artistId,
      date,
      timeSlot,
      clientName,
      clientPhone,
      clientEmail,
      venueName,
      venueAddress,
      governorate,
    } = body

    // التحقق من البيانات المطلوبة
    if (!artistId || !date || !timeSlot || !clientName || !clientPhone) {
      console.error("❌ Missing required fields")
      return NextResponse.json(
        { error: "جميع الحقول المطلوبة يجب أن تكون مكتملة" },
        { status: 400 }
      )
    }

    // التحقق من وجود الفنان
    console.log(`🔍 Looking for artist: ${artistId}`)
    const artist = await prisma.artist.findUnique({
      where: { id: artistId },
    })

    if (!artist) {
      console.error(`❌ Artist not found: ${artistId}`)
      return NextResponse.json({ error: "الفنان غير موجود" }, { status: 404 })
    }

    console.log(`✅ Artist found: ${artist.name}`)

    // التحقق من توفر الموعد أو إنشاؤه تلقائياً
    let existingSlot = await prisma.availability.findFirst({
      where: {
        artistId,
        date: new Date(date),
        timeSlot,
      },
    })

    if (!existingSlot) {
      console.log(`🔄 Creating availability slot: ${date} - ${timeSlot}`)
      existingSlot = await prisma.availability.create({
        data: {
          artistId,
          date: new Date(date),
          timeSlot: timeSlot as any,
          status: "AVAILABLE",
        }
      })
    }

    if (existingSlot.status !== "AVAILABLE") {
      console.error("❌ Slot already booked")
      return NextResponse.json(
        { error: "الموعد محجوز بالفعل" },
        { status: 400 }
      )
    }

    console.log("✅ Slot is available")

    // ✅ حساب الأسعار بناءً على المحافظة المختارة
    let grossAmount: number | null = null
    let depositAmount: number | null = null
    let remainingAmount: number | null = null

    if (governorate && governorate !== "أخرى") {
      console.log(`💰 Looking for pricing: artist=${artistId}, governorate=${governorate}`)
      
      try {
        const pricing = await prisma.pricing.findFirst({
          where: {
            artistId,
            governorate,
          }
        })

        if (pricing) {
          grossAmount = pricing.basePrice + pricing.transportationFee
          depositAmount = Math.max(5000, Math.round(grossAmount * 0.3))
          remainingAmount = grossAmount - depositAmount
          console.log(`💰 Calculated pricing for ${governorate}: ${grossAmount} ج.م (عربون: ${depositAmount} ج.م)`)
        } else {
          console.log(`⚠️ No pricing found for governorate: ${governorate}`)
        }
      } catch (pricingError: any) {
        console.error("❌ Error fetching pricing:", pricingError.message)
        // نستمر بدون أسعار لو فيه مشكلة
      }
    } else {
      console.log("⚠️ No governorate selected or 'أخرى' selected")
    }

    // إنشاء أو العثور على المكان
    let venue
    try {
      console.log(`🔍 Looking for venue: ${venueName || "مكان غير محدد"}`)
      venue = await prisma.venue.findFirst({
        where: {
          name: venueName || "مكان غير محدد",
        },
      })

      if (!venue) {
        console.log("🔄 Creating new venue")
        venue = await prisma.venue.create({
          data: {
            name: venueName || "مكان غير محدد",
            governorate: governorate || "غير محدد",
            area: "غير محدد",
            address: venueAddress || "غير محدد",
          },
        })
      }
      console.log(`✅ Venue ready: ${venue.name}`)
    } catch (venueError: any) {
      console.error("❌ Error creating venue:", venueError.message)
      return NextResponse.json(
        { error: "فشل في إنشاء المكان" },
        { status: 500 }
      )
    }

    // إنشاء أو العثور على العميل
    let customer = null
    let customerId = null

    if (session?.user) {
      try {
        customer = await prisma.customer.findUnique({
          where: { userId: session.user.id as string },
        })

        if (!customer) {
          console.log("🔄 Creating new customer")
          customer = await prisma.customer.create({
            data: {
              userId: session.user.id as string,
              fullName: clientName,
              phone: clientPhone,
            },
          })
        }
        customerId = customer.id
        console.log(`✅ Customer ready: ${customer.fullName}`)
      } catch (customerError: any) {
        console.error("❌ Error creating customer:", customerError.message)
        // نستمر بدون customerId
      }
    }

    // إنشاء الحجز
    console.log("📝 Creating booking...")
    let booking
    try {
      booking = await prisma.booking.create({
        data: {
          artistId,
          customerId,
          clientName,
          clientPhone,
          clientEmail: clientEmail || null,
          venueId: venue.id,
          date: new Date(date),
          timeSlot: timeSlot as any,
          status: "PENDING_APPROVAL",
          grossAmount,
          depositAmount,
          remainingAmount,
        },
        include: {
          artist: { select: { name: true } },
          venue: { select: { name: true } },
        },
      })
      console.log(`✅ Booking created: ${booking.id}`)
    } catch (bookingError: any) {
      console.error("❌ Error creating booking:", bookingError.message)
      return NextResponse.json(
        { error: "فشل في إنشاء الحجز" },
        { status: 500 }
      )
    }

    // تحديث حالة الموعد إلى BOOKED
    try {
      await prisma.availability.update({
        where: { id: existingSlot.id },
        data: {
          status: "BOOKED",
          bookingId: booking.id,
        },
      })
      console.log("✅ Slot marked as BOOKED")
    } catch (updateError: any) {
      console.error("⚠️ Error updating slot status:", updateError.message)
      // لا نوقف العملية لو فشل التحديث
    }

    // إرسال إشعار واتساب للأدمن
    try {
      const notification = await sendWhatsAppNotification(booking, artist.name, venue.name)
      if (notification.success) {
        console.log("✅ WhatsApp notification prepared")
      }
    } catch (err: any) {
      console.error("❌ WhatsApp notification error:", err.message)
    }

    console.log("🎉 Booking process completed successfully")
    return NextResponse.json(booking, { status: 201 })
  } catch (error: any) {
    console.error("❌ Bookings POST error:", error.message)
    console.error("❌ Error stack:", error.stack)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}