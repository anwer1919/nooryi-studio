"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// ✅ تأكيد الحجز
export async function approveBooking(bookingId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
      return { success: false, error: "غير مصرح" }
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "APPROVED" },
      include: { artist: true },
    })

    // إشعار للعميل
    try {
      if (booking.clientEmail) {
        const user = await prisma.user.findUnique({
          where: { email: booking.clientEmail },
        })
        
        if (user) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: "تم تأكيد حجزك! 🎉",
              message: `تم تأكيد حجزك للفنان ${booking.artist?.name}`,
              type: "booking_approved",
              link: `/booking/${booking.id}`,
            },
          })
        }
      }
    } catch (error) {
      console.error("Notification error:", error)
    }

    revalidatePath("/admin/bookings")
    revalidatePath(`/admin/bookings/${bookingId}`)
    
    return { success: true, message: "تم تأكيد الحجز بنجاح" }
  } catch (error: any) {
    console.error("Approve error:", error)
    return { success: false, error: error.message }
  }
}

// ✅ رفض الحجز
export async function rejectBooking(bookingId: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
      return { success: false, error: "غير مصرح" }
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
      include: { artist: true },
    })

    // إشعار للعميل
    try {
      if (booking.clientEmail) {
        const user = await prisma.user.findUnique({
          where: { email: booking.clientEmail },
        })
        
        if (user) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: "تم رفض الحجز",
              message: `نعتذر، تم رفض حجزك للفنان ${booking.artist?.name}`,
              type: "booking_rejected",
            },
          })
        }
      }
    } catch (error) {
      console.error("Notification error:", error)
    }

    revalidatePath("/admin/bookings")
    revalidatePath(`/admin/bookings/${bookingId}`)
    
    return { success: true, message: "تم رفض الحجز" }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ✅ تأكيد الدفع
export async function confirmPayment(
  bookingId: string, 
  amount: number, 
  type: "deposit" | "full"
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
      return { success: false, error: "غير مصرح" }
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { artist: true },
    })

    if (!booking) {
      return { success: false, error: "الحجز غير موجود" }
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        depositAmount: type === "deposit" ? amount : booking.depositAmount,
        remainingAmount: type === "full" ? 0 : booking.remainingAmount,
        status: type === "full" ? "COMPLETED" : booking.status,
      },
    })

    await prisma.payment.create({
      data: {
        bookingId,
        amount,
        status: "COMPLETED",
        method: "CREDIT_CARD",
        confirmedBy: session.user.id,
        confirmedAt: new Date(),
        notes: type === "deposit" ? "دفع العربون" : "الدفع الكامل",
      },
    })

    // إشعار للعميل
    try {
      if (booking.clientEmail) {
        const user = await prisma.user.findUnique({
          where: { email: booking.clientEmail },
        })
        
        if (user) {
          const paymentType = type === "deposit" ? "العربون" : "المبلغ الكامل"
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: `تم تأكيد ${paymentType} ✅`,
              message: `تم تأكيد دفع ${paymentType} بمبلغ ${amount.toLocaleString()} ج.م`,
              type: "payment_confirmed",
              link: `/booking/${bookingId}/invoice`,
            },
          })
        }
      }
    } catch (error) {
      console.error("Notification error:", error)
    }

    revalidatePath("/admin/bookings")
    revalidatePath(`/admin/bookings/${bookingId}`)
    
    return { 
      success: true, 
      message: `تم تأكيد ${type === "deposit" ? "العربون" : "الدفع الكامل"} بنجاح` 
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}