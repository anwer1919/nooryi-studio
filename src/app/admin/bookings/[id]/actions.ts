"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail, bookingConfirmationTemplate, bookingRejectionTemplate, paymentReceiptTemplate } from "@/lib/email"
import { revalidatePath } from "next/cache"

async function getSessionUser() {
  const session = await auth()
  if (!session?.user) return null
  const role = (session.user as any).role || "USER"
  if (role !== "SUPER_ADMIN" && role !== "ADMIN" && role !== "ARTIST_MANAGER") return null
  return { id: (session.user as any).id, role }
}

async function managerArtistId(userId: string): Promise<string | null> {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { artistId: true } })
  return u?.artistId || null
}

function loadBooking(id: string) {
  return prisma.booking.findUnique({ where: { id }, include: { artist: true, venue: true, customer: true } })
}

function clientEmailOf(b: any): string | null {
  return b?.clientEmail || b?.customer?.email || null
}

export async function approveBooking(bookingId: string) {
  const user = await getSessionUser()
  if (!user) return { success: false, error: "غير مصرح لك" }
  try {
    const existing = await loadBooking(bookingId)
    if (!existing) return { success: false, error: "الحجز غير موجود" }
    if (user.role === "ARTIST_MANAGER") {
      const aid = await managerArtistId(user.id)
      if (!aid || aid !== existing.artistId) return { success: false, error: "هذا ليس حجز فنانك" }
    }
    const updated = await prisma.booking.update({ where: { id: bookingId }, data: { status: "CONFIRMED" }, include: { artist: true, venue: true, customer: true } })
    const to = clientEmailOf(updated)
    let emailSent = false
    if (to) {
      const r = await sendEmail({ to, subject: "✅ تم تأكيد حجزك — Nooryi Studio", html: bookingConfirmationTemplate(updated) })
      emailSent = r.success === true
      if (!emailSent) console.error("❌ [BOOKING] confirmation email failed:", r.error)
    } else {
      console.error("❌ [BOOKING] no client email for booking:", bookingId)
    }
    revalidatePath("/admin/bookings")
    revalidatePath("/admin/bookings/" + bookingId)
    return { success: true, message: emailSent ? "تم تأكيد الحجز وإرسال إشعار للعميل" : "تم تأكيد الحجز (تعذر إرسال الإيميل)" }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function rejectBooking(bookingId: string) {
  const user = await getSessionUser()
  if (!user) return { success: false, error: "غير مصرح لك" }
  try {
    const existing = await loadBooking(bookingId)
    if (!existing) return { success: false, error: "الحجز غير موجود" }
    if (user.role === "ARTIST_MANAGER") {
      const aid = await managerArtistId(user.id)
      if (!aid || aid !== existing.artistId) return { success: false, error: "هذا ليس حجز فنانك" }
    }
    const updated = await prisma.booking.update({ where: { id: bookingId }, data: { status: "REJECTED" }, include: { artist: true, venue: true, customer: true } })
    const to = clientEmailOf(updated)
    if (to) await sendEmail({ to, subject: "❌ اعتذار عن الحجز — Nooryi Studio", html: bookingRejectionTemplate(updated) })
    revalidatePath("/admin/bookings")
    revalidatePath("/admin/bookings/" + bookingId)
    return { success: true, message: "تم رفض الحجز وإشعار العميل" }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function confirmPayment(bookingId: string, amount: number, type: "deposit" | "full" = "deposit") {
  const user = await getSessionUser()
  if (!user) return { success: false, error: "غير مصرح لك" }
  try {
    const existing = await loadBooking(bookingId)
    if (!existing) return { success: false, error: "الحجز غير موجود" }
    if (user.role === "ARTIST_MANAGER") {
      const aid = await managerArtistId(user.id)
      if (!aid || aid !== existing.artistId) return { success: false, error: "هذا ليس حجز فنانك" }
    }
    const amt = Number(amount || 0)
    await prisma.payment.create({ data: { bookingId, amount: amt, status: "COMPLETED", method: "CASH", confirmedBy: user.id, confirmedAt: new Date() } })
    const data: any = {}
    if (type === "full") {
      data.depositAmount = Number(existing.grossAmount || 0)
      data.remainingAmount = 0
    } else {
      data.depositAmount = Number(existing.depositAmount || 0) + amt
      data.remainingAmount = Math.max(0, Number(existing.grossAmount || 0) - data.depositAmount)
    }
    const updated = await prisma.booking.update({ where: { id: bookingId }, data, include: { artist: true, venue: true, customer: true } })
    const to = clientEmailOf(updated)
    if (to) await sendEmail({ to, subject: "💳 تم استلام الدفعة — Nooryi Studio", html: paymentReceiptTemplate(updated, amt, type) })
    revalidatePath("/admin/bookings")
    revalidatePath("/admin/bookings/" + bookingId)
    return { success: true, message: "تم تأكيد الدفعة وإشعار العميل" }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}