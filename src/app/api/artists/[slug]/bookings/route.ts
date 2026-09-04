import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const artist = await prisma.artist.findUnique({
      where: { slug },
      select: { id: true, name: true }
    })

    if (!artist) {
      return NextResponse.json({ error: "الفنان غير موجود" }, { status: 404 })
    }

    // جلب الحجوزات النشطة فقط (الموافقة والمؤكدة والمكتملة)
    const bookings = await prisma.booking.findMany({
      where: {
        artistId: artist.id,
        status: { in: ["APPROVED", "CONFIRMED", "COMPLETED"] }
      },
      orderBy: { date: "asc" }
    })

    // تحويل البيانات للصيغة المتوقعة
    const formattedBookings = bookings.map(b => ({
      id: b.id,
      date: b.date,
      eventDate: b.date,
      timeSlot: b.timeSlot,
      status: b.status,
      clientName: b.clientName,
      clientPhone: b.clientPhone,
    }))

    return NextResponse.json(formattedBookings)
  } catch (error: any) {
    console.error("Bookings API Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}