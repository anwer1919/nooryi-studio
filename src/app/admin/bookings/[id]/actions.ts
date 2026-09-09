"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
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

function fmtDate(d: any) {
  try { return new Date(d).toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) } catch { return "—" }
}

const timeLabels: Record<string, string> = { MORNING: "صباحاً", AFTERNOON: "ظهراً", EVENING: "مساءً", NIGHT: "ليلاً" }

function confirmationHtml(b: any) {
  const total = Number(b.grossAmount || 0).toLocaleString()
  const deposit = Number(b.depositAmount || 0).toLocaleString()
  return `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#faf8f0;padding:30px;border-radius:20px">
    <div style="background:linear-gradient(135deg,#d4af37,#b8941f);padding:20px;border-radius:15px;text-align:center;margin-bottom:20px">
      <h1 style="color:#111;margin:0;font-size:22px">Nooryi Studio</h1>
      <p style="color:#333;margin:6px 0 0;font-size:14px">✅ تم تأكيد حجزك بنجاح</p>
    </div>
    <div style="background:#fff;padding:24px;border-radius:15px;border:2px solid #d4af37">
      <p style="color:#333;font-size:15px;margin:0 0 14px">مرحباً <b>${b.clientName || "عميلنا العزيز"}</b>،</p>
      <p style="color:#666;font-size:14px;margin:0 0 16px">يسعدنا تأكيد حجزك. التفاصيل:</p>
      <table style="width:100%;font-size:14px;color:#333;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#888">الفنان:</td><td style="padding:8px 0;font-weight:bold">${b.artist?.name || "—"}</td></tr>
        <tr><td style="padding:8px 0;color:#888">التاريخ:</td><td style="padding:8px 0;font-weight:bold">${fmtDate(b.date)}</td></tr>
        <tr><td style="padding:8px 0;color:#888">الوقت:</td><td style="padding:8px 0;font-weight:bold">${timeLabels[b.timeSlot] || b.timeSlot || "—"}</td></tr>
        <tr><td style="padding:8px 0;color:#888">المكان:</td><td style="padding:8px 0;font-weight:bold">${b.venue?.name || "سيتم تحديده"}</td></tr>
        <tr><td style="padding:8px 0;color:#888">الإجمالي:</td><td style="padding:8px 0;font-weight:bold;color:#b8941f">${total} ج.م</td></tr>
        <tr><td style="padding:8px 0;color:#888">العربون:</td><td style="padding:8px 0;font-weight:bold">${deposit} ج.م</td></tr>
      </table>
    </div>
    <p style="color:#999;font-size:12px;text-align:center;margin-top:16px">لأي استفسار تواصل معنا عبر المنصة</p>
  </div>`
}

function rejectionHtml(b: any) {
  return `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#faf8f0;padding:30px;border-radius:20px;text-align:center">
    <div style="background:#dc2626;padding:18px;border-radius:15px;margin-bottom:18px"><h1 style="color:#fff;margin:0;font-size:20px">❌ اعتذار عن الحجز</h1></div>
    <div style="background:#fff;padding:24px;border-radius:15px;border:2px solid #e5e7eb">
      <p style="color:#333;font-size:15px">مرحباً <b>${b.clientName || "عميلنا العزيز"}</b>،</p>
      <p style="color:#666;font-size:14px">نعتذر، تعذر تأكيد حجزك بتاريخ ${fmtDate(b.date)}. يمكنك اختيار موعد آخر أو فنان آخر من المنصة.</p>
    </div>
  </div>`
}

function paymentHtml(b: any, amount: number, type: string) {
  return `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#faf8f0;padding:30px;border-radius:20px;text-align:center">
    <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:18px;border-radius:15px;margin-bottom:18px"><h1 style="color:#fff;margin:0;font-size:20px">💳 تم استلام الدفعة</h1></div>
    <div style="background:#fff;padding:24px;border-radius:15px;border:2px solid #16a34a">
      <p style="color:#333;font-size:15px">مرحباً <b>${b.clientName || "عميلنا العزيز"}</b>،</p>
      <p style="color:#666;font-size:14px">تم تأكيد استلام ${type === "full" ? "المبلغ الكامل" : "العربون"} بقيمة <b style="color:#16a34a">${Number(amount).toLocaleString()} ج.م</b> لحجزك بتاريخ ${fmtDate(b.date)}.</p>
    </div>
  </div>`
}

export async function approveBooking(bookingId: string) {
  const user = await getSessionUser()
  if (!user) return { success: false, error: "غير مصرح لك" }
  try {
    const existing = await prisma.booking.findUnique({ where: { id: bookingId }, include: { artist: true, venue: true } })
    if (!existing) return { success: false, error: "الحجز غير موجود" }
    if (user.role === "ARTIST_MANAGER") {
      const aid = await managerArtistId(user.id)
      if (!aid || aid !== existing.artistId) return { success: false, error: "هذا ليس حجز فنانك" }
    }
    const updated = await prisma.booking.update({ where: { id: bookingId }, data: { status: "CONFIRMED" }, include: { artist: true, venue: true } })
    let emailSent = false
    if (updated.clientEmail) {
      const r = await sendEmail({ to: updated.clientEmail, subject: "✅ تم تأكيد حجزك — Nooryi Studio", html: confirmationHtml(updated) })
      emailSent = r.success === true
      if (!emailSent) console.error("❌ Confirmation email failed:", r.error)
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
    const existing = await prisma.booking.findUnique({ where: { id: bookingId }, include: { artist: true, venue: true } })
    if (!existing) return { success: false, error: "الحجز غير موجود" }
    if (user.role === "ARTIST_MANAGER") {
      const aid = await managerArtistId(user.id)
      if (!aid || aid !== existing.artistId) return { success: false, error: "هذا ليس حجز فنانك" }
    }
    const updated = await prisma.booking.update({ where: { id: bookingId }, data: { status: "REJECTED" }, include: { artist: true, venue: true } })
    if (updated.clientEmail) {
      await sendEmail({ to: updated.clientEmail, subject: "❌ اعتذار عن الحجز — Nooryi Studio", html: rejectionHtml(updated) })
    }
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
    const existing = await prisma.booking.findUnique({ where: { id: bookingId }, include: { artist: true, venue: true } })
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
    const updated = await prisma.booking.update({ where: { id: bookingId }, data, include: { artist: true, venue: true } })
    if (updated.clientEmail) {
      await sendEmail({ to: updated.clientEmail, subject: "💳 تم استلام الدفعة — Nooryi Studio", html: paymentHtml(updated, amt, type) })
    }
    revalidatePath("/admin/bookings")
    revalidatePath("/admin/bookings/" + bookingId)
    return { success: true, message: "تم تأكيد الدفعة وإشعار العميل" }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}