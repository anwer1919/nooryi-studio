import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/permissions"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !isAdmin(session.user as any)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role

    // ✅ الحل الجذري: شرط where مدمج مع as any مباشرة
    const bookings = await prisma.booking.findMany({
      where: {
        ...(userRole === "ARTIST_ADMIN" ? { artistId: String((session.user as any).artistId) } : {}),
      } as any,
      orderBy: { createdAt: "desc" },
      include: {
        artist: { select: { name: true, slug: true, profileImage: true, category: true } },
        customer: { select: { fullName: true, phone: true } },
        venue: { select: { name: true, address: true } },
        review: { select: { id: true, rating: true } },
      },
    })

    return NextResponse.json(bookings)
  } catch (error: any) {
    console.error("❌ Admin Bookings GET error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !isAdmin(session.user as any)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { artistId, date, timeSlot, clientName, clientPhone, clientEmail, venueName, venueAddress } = body

    if (!artistId || !date || !timeSlot || !clientName || !clientPhone) {
      return NextResponse.json({ error: "جميع الحقول المطلوبة يجب أن تكون مكتملة" }, { status: 400 })
    }

    const artist = await prisma.artist.findUnique({ where: { id: artistId } })
    if (!artist) return NextResponse.json({ error: "الفنان غير موجود" }, { status: 404 })

    let existingSlot = await prisma.availability.findFirst({
      where: { artistId, date: new Date(date), timeSlot }
    })

    if (!existingSlot) {
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
      return NextResponse.json({ error: "الموعد محجوز بالفعل" }, { status: 400 })
    }

    let venue = await prisma.venue.findFirst({ where: { name: venueName || "مكان غير محدد" } })
    if (!venue) {
      venue = await prisma.venue.create({
        data: {
          name: venueName || "مكان غير محدد",
          governorate: "غير محدد",
          area: "غير محدد",
          address: venueAddress || "غير محدد",
        }
      })
    }

    const booking = await prisma.booking.create({
      data: {
        artistId,
        clientName,
        clientPhone,
        clientEmail: clientEmail || null,
        venueId: venue.id,
        date: new Date(date),
        timeSlot: timeSlot as any,
        status: "PENDING_APPROVAL",
      },
      include: {
        artist: { select: { name: true } },
        venue: { select: { name: true } },
      },
    })

    await prisma.availability.update({
      where: { id: existingSlot.id },
      data: { status: "BOOKED", bookingId: booking.id }
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error: any) {
    console.error("❌ [Admin] Bookings POST error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}