"use server"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail, bookingApprovedTemplate, paymentConfirmedTemplate } from "@/lib/email"

export async function approveBooking(bookingId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || ((session.user as any).role !== "SUPER_ADMIN" && (session.user as any).role !== "ADMIN")) return { success: false, error: "غير مصرح" }
    const booking = await prisma.booking.update({ where: { id: bookingId }, data: { status: "APPROVED" }, include: { artist: true, customer: true } })
    // إشعار داخلي
    try {
      if (booking.clientEmail) {
        const user = await prisma.user.findUnique({ where: { email: booking.clientEmail } })
        if (user) await prisma.notification.create({ data: { userId: user.id, title: "✅ تم تأكيد حجزك!", message: `تم تأكيد حجزك للفنان ${booking.artist?.name}. يمكنك الآن إتمام الدفع.`, type: "BOOKING_APPROVED", relatedId: booking.id } })
      }
    } catch (e) { console.error("Notification error:", e) }
    // بريد للعميل
    try { if (booking.clientEmail) await sendEmail({ to: booking.clientEmail, subject: `✅ تم تأكيد حجزك — ${booking.artist?.name}`, html: bookingApprovedTemplate(booking) }) } catch (e) { console.error("Email error:", e) }
    revalidatePath("/admin/bookings"); revalidatePath(`/admin/bookings/${bookingId}`); revalidatePath("/my-bookings")
    return { success: true, message: "تم تأكيد الحجز وإرسال إشعار للعميل" }
  } catch (error: any) { return { success: false, error: error.message } }
}

export async function rejectBooking(bookingId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || ((session.user as any).role !== "SUPER_ADMIN" && (session.user as any).role !== "ADMIN")) return { success: false, error: "غير مصرح" }
    await prisma.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED" }, include: { artist: true } })
    revalidatePath("/admin/bookings"); revalidatePath(`/admin/bookings/${bookingId}`); revalidatePath("/my-bookings")
    return { success: true, message: "تم رفض الحجز" }
  } catch (error: any) { return { success: false, error: error.message } }
}

export async function confirmPayment(bookingId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || ((session.user as any).role !== "SUPER_ADMIN" && (session.user as any).role !== "ADMIN")) return { success: false, error: "غير مصرح" }
    const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { artist: true, payments: { orderBy: { createdAt: "desc" } } } })
    if (!booking) return { success: false, error: "الحجز غير موجود" }
    await prisma.payment.updateMany({ where: { bookingId, status: "PENDING" }, data: { status: "COMPLETED" } })
    const allPayments = await prisma.payment.findMany({ where: { bookingId, status: "COMPLETED" } })
    const totalPaid = allPayments.reduce((s: number, p: any) => s + Number(p.amount || 0), 0)
    const grossAmount = Number(booking.grossAmount || 0)
    const remaining = Math.max(0, grossAmount - totalPaid)
    const newStatus = remaining === 0 ? "COMPLETED" : "CONFIRMED"
    const updated = await prisma.booking.update({ where: { id: bookingId }, data: { status: newStatus, depositAmount: totalPaid, remainingAmount: remaining }, include: { artist: true } })
    const lastPayment = allPayments[0] || { transactionId: "TXN-" + Date.now(), amount: totalPaid }
    // بريد للعميل مع الفاتورة
    try { if (booking.clientEmail) await sendEmail({ to: booking.clientEmail, subject: `✅ تم تأكيد الدفع — ${booking.artist?.name}`, html: paymentConfirmedTemplate(updated, lastPayment) }) } catch (e) { console.error("Email error:", e) }
    // إشعار داخلي
    try {
      if (booking.clientEmail) {
        const user = await prisma.user.findUnique({ where: { email: booking.clientEmail } })
        if (user) await prisma.notification.create({ data: { userId: user.id, title: "✅ تم تأكيد الدفع", message: `تم تأكيد دفع ${totalPaid.toLocaleString()} ج.م لحجز ${booking.artist?.name}`, type: "PAYMENT_CONFIRMED", relatedId: booking.id } })
      }
    } catch (e) { console.error("Notification error:", e) }
    revalidatePath("/admin/bookings"); revalidatePath(`/admin/bookings/${bookingId}`); revalidatePath("/my-bookings")
    return { success: true, message: `تم تأكيد الدفع — ${newStatus === "COMPLETED" ? "الحجز مكتمل" : "الحجز مؤكد"}` }
  } catch (error: any) { return { success: false, error: error.message } }
}