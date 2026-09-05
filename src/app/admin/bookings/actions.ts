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

// ═══════════ تأكيد الدفع (للأدمن) ═══════════
export async function confirmPayment(bookingId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || ((session.user as any).role !== "SUPER_ADMIN" && (session.user as any).role !== "ADMIN")) {
      return { success: false, error: "غير مصرح" }
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { artist: true, payments: { orderBy: { createdAt: "desc" } } },
    })

    if (!booking) {
      return { success: false, error: "الحجز غير موجود" }
    }

    // تحديث حالة الدفعات إلى COMPLETED
    await prisma.payment.updateMany({
      where: { bookingId, status: "PENDING" },
      data: { status: "COMPLETED" },
    })

    // حساب المبالغ
    const totalPaid = booking.payments
      .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0)

    const grossAmount = Number(booking.grossAmount || 0)
    const remaining = Math.max(0, grossAmount - totalPaid)

    // تحديث الحجز
    const newStatus = remaining === 0 ? "COMPLETED" : "CONFIRMED"

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: newStatus,
        depositAmount: totalPaid,
        remainingAmount: remaining,
      },
      include: { artist: true },
    })

    // إرسال بريد تأكيد الدفع للعميل
    try {
      if (booking.clientEmail) {
        const { sendEmail, paymentConfirmedTemplate } = await import("@/lib/email")
        await sendEmail({
          to: booking.clientEmail,
          subject: `✅ تم استلام الدفع — ${booking.artist?.name}`,
          html: paymentConfirmedTemplate(updatedBooking, {
            transactionId: `TXN-${Date.now()}`,
            amount: totalPaid,
          }),
        })
      }
    } catch (e) {
      console.error("Email error:", e)
    }

    // إشعار داخلي
    try {
      if (booking.clientEmail) {
        const user = await prisma.user.findUnique({ where: { email: booking.clientEmail } })
        if (user) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: "✅ تم استلام الدفع بنجاح",
              message: `تم تأكيد دفع ${totalPaid.toLocaleString()} ج.م لحجز ${booking.artist?.name}`,
              type: "PAYMENT_CONFIRMED",
              relatedId: booking.id,
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

    return { 
      success: true, 
      message: `تم تأكيد الدفع — ${newStatus === "COMPLETED" ? "الحجز مكتمل" : "الحجز مؤكد"}` 
    }
  } catch (error: any) {
    console.error("Confirm payment error:", error)
    return { success: false, error: error.message }
  }
}