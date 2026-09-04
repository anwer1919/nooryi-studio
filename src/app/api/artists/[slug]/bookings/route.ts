import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    // جلب الفنان
    const artist = await prisma.artist.findUnique({
      where: { slug },
      select: { id: true, name: true }
    })

    if (!artist) {
      return NextResponse.json({ error: "الفنان غير موجود" }, { status: 404 })
    }

    // جلب الحجوزات
    const bookings = await prisma.booking.findMany({
      where: {
        artistId: artist.id,
        status: { in: ["PENDING_APPROVAL", "APPROVED", "CONFIRMED", "COMPLETED"] }
      },
      include: {
        venue: { select: { name: true, address: true, city: true } },
      },
      orderBy: { date: "asc" }
    })

    // تحويل البيانات للصيغة المتوقعة من التقويم
    const formattedBookings = bookings.map(b => ({
      id: b.id,
      eventDate: b.date,
      eventTime: b.timeSlot === "MORNING" ? "صباحاً (8-12)" :
                 b.timeSlot === "AFTERNOON" ? "ظهراً (12-5)" :
                 b.timeSlot === "EVENING" ? "مساءً (5-9)" :
                 b.timeSlot === "NIGHT" ? "ليلاً (9-12)" : b.timeSlot,
      eventType: "حجز " + artist.name,
      location: b.venue?.name || b.venue?.address || "غير محدد",
      clientName: b.clientName,
      clientPhone: b.clientPhone,
      status: b.status,
      grossAmount: b.grossAmount,
    }))

    return NextResponse.json(formattedBookings)
  } catch (error: any) {
    console.error("Bookings API Error:", error)
    return NextResponse.json(
      { error: error.message || "خطأ في الخادم" },
      { status: 500 }
    )
  }
}