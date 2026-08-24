import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendNotification } from "@/lib/notifications"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, adminNotes } = body

    const booking = await prisma.booking.findUnique({ 
      where: { id },
      include: { artist: true, customer: true }
    })
    
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes || null,
      },
      include: {
        artist: { select: { name: true } },
        venue: { select: { name: true } },
      }
    })

    // لو الحجز اتقبل
    if (status === "APPROVED") {
      await prisma.availability.updateMany({
        where: {
          artistId: booking.artistId,
          date: booking.date,
          timeSlot: booking.timeSlot,
        },
        data: { status: "BOOKED" }
      })

      // إرسال إشعار للعميل (إن كان مسجلاً)
      if (booking.customer?.userId) {
        await sendNotification({
          userId: booking.customer.userId,
          title: "✅ تم تأكيد حجزك",
          message: `تم تأكيد حجزك للفنان ${booking.artist.name} يوم ${new Date(booking.date).toLocaleDateString("ar-EG")}`,
        })
      }
    }

    // لو الحجز اترفض
    if (status === "REJECTED" || status === "CANCELLED") {
      await prisma.availability.updateMany({
        where: {
          artistId: booking.artistId,
          date: booking.date,
          timeSlot: booking.timeSlot,
        },
        data: { status: "AVAILABLE", bookingId: null }
      })

      // إرسال إشعار للعميل (إن كان مسجلاً)
      if (booking.customer?.userId) {
        await sendNotification({
          userId: booking.customer.userId,
          title: "❌ تم رفض حجزك",
          message: `نعتذر، لم نتمكن من تأكيد حجزك للفنان ${booking.artist.name}. يمكنك تجربة موعد آخر.`,
        })
      }
    }

    console.log(`✅ Booking ${id} updated to: ${status}`)
    return NextResponse.json(updatedBooking)
  } catch (error: any) {
    console.error("❌ Booking PATCH error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}