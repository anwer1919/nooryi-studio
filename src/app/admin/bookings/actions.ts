"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail, bookingApprovedTemplate } from "@/lib/email"

// ═══════════ تأكيد الحجز ═══════════
export async function approveBooking(bookingId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || ((session.user as any).role !== "SUPER_ADMIN" && (session.user as any).role !== "ADMIN")) {
      return { success: false, error: "غير مصرح" }
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "APPROVED" },
      include: { artist: true, customer: true },
    })

    // 1) إشعار داخلي
    try {
      if (booking.clientEmail) {
        const user = await prisma.user.findUnique({ where: { email: booking.clientEmail } })
        if (user) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: "تم تأكيد حجزك! 🎉",
              message: `تم تأكيد حجزك للفنان ${booking.artist?.name}. يمكنك الآن إتمام الدفع.`,
              type: "BOOKING_APPROVED",
              relatedId: booking.id,
            },
          })
        }
      }
    } catch (e) {
      console.error("Notification error:", e)
    }

    // 2) إرسال بريد إلكتروني
    try {
      if (booking.clientEmail) {
        await sendEmail({
          to: booking.clientEmail,
          subject: `✅ تم تأكيد حجزك — ${booking.artist?.name}`,
          html: bookingApprovedTemplate(booking),
        })
      }
    } catch (e) {
      console.error("Email error:", e)
    }

    revalidatePath("/admin/bookings")
    revalidatePath(`/admin/bookings/${bookingId}`)
    revalidatePath("/my-bookings")

    return { success: true, message: "تم تأكيد الحجز وإرسال إشعار للعميل" }
  } catch (error: any) {
    console.error("Approve error:", error)
    return { success: false, error: error.message }
  }
}

// ═══════════ رفض الحجز ═══════════
export async function rejectBooking(bookingId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || ((session.user as any).role !== "SUPER_ADMIN" && (session.user as any).role !== "ADMIN")) {
      return { success: false, error: "غير مصرح" }
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
      include: { artist: true },
    })

    try {
      if (booking.clientEmail) {
        const user = await prisma.user.findUnique({ where: { email: booking.clientEmail } })
        if (user) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: "تم رفض الحجز",
              message: `نعتذر، تم رفض حجزك للفنان ${booking.artist?.name}`,
              type: "BOOKING_REJECTED",
            },
          })
        }
      }
    } catch (e) {
      console.error("Notification error:", e)
    }

    revalidatePath("/admin/bookings")
    revalidatePath(`/admin/bookings/${bookingId}`)
    revalidatePath("/my-bookings")

    return { success: true, message: "تم رفض الحجز" }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}