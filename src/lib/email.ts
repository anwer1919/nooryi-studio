import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

const BASE = process.env.NEXTAUTH_URL || "https://nooryi-studio.vercel.app"
const FROM_NAME = process.env.EMAIL_FROM_NAME || "Nooryi Studio"

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log("📧 [DEV] No email credentials set")
      return { success: false, devMode: true, error: "EMAIL_USER or EMAIL_PASSWORD not set" }
    }

    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    })

    console.log("✅ Email sent:", info.messageId, "→", to)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error("❌ Email failed:", error.message, "| Code:", error.code)
    return { success: false, error: error.message, code: error.code }
  }
}

export function otpEmailTemplate(otp: string) {
  return `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#faf8f0;padding:30px;border-radius:20px;text-align:center">
    <div style="background:linear-gradient(135deg,#d4af37,#b8941f);padding:20px;border-radius:15px;margin-bottom:20px">
      <h1 style="color:#111;margin:0;font-size:24px">Nooryi Studio</h1>
      <p style="color:#333;margin:5px 0 0;font-size:13px">رمز التحقق</p>
    </div>
    <div style="background:white;padding:30px;border-radius:15px;border:2px solid #d4af37;margin-bottom:20px">
      <p style="color:#666;margin:0 0 15px">استخدم هذا الرمز لإكمال تسجيل الدخول</p>
      <span style="font-size:40px;font-weight:900;letter-spacing:10px;color:#111">${otp}</span>
    </div>
    <p style="color:#999;font-size:12px">⏰ صالح لمدة 5 دقائق | 🔒 لا تشاركه مع أحد</p>
  </div>`
}

export function newBookingAdminTemplate(booking: any) {
  return `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#faf8f0;padding:30px;border-radius:20px">
    <div style="text-align:center;margin-bottom:20px"><h1 style="color:#D4AF37;margin:0">🎵 حجز جديد بانتظار المراجعة</h1></div>
    <div style="background:white;padding:20px;border-radius:15px;border:2px solid #D4AF37;margin-bottom:20px">
      <table style="width:100%"><tr><td style="padding:8px 0;color:#666">العميل:</td><td style="padding:8px 0;font-weight:bold">${booking.clientName}</td></tr>
      <tr><td style="padding:8px 0;color:#666">الهاتف:</td><td style="padding:8px 0" dir="ltr">${booking.clientPhone}</td></tr>
      <tr><td style="padding:8px 0;color:#666">الفنان:</td><td style="padding:8px 0;font-weight:bold">${booking.artist?.name || "—"}</td></tr>
      <tr><td style="padding:8px 0;color:#666">التاريخ:</td><td style="padding:8px 0">${new Date(booking.date).toLocaleDateString("ar-EG")}</td></tr>
      <tr><td style="padding:8px 0;color:#666">المبلغ:</td><td style="padding:8px 0;font-weight:bold;color:#D4AF37">${Number(booking.grossAmount || 0).toLocaleString()} ج.م</td></tr></table>
    </div>
    <div style="text-align:center"><a href="${BASE}/admin/bookings/${booking.id}" style="display:inline-block;background:#111;color:#D4AF37;padding:14px 40px;text-decoration:none;border-radius:10px;font-weight:bold">مراجعة الحجز</a></div>
  </div>`
}

export function bookingApprovedTemplate(booking: any) {
  const BASE = process.env.NEXTAUTH_URL || "https://nooryi-studio.vercel.app"
  const payLink = `${BASE}/booking/${booking.artist?.slug || "artist"}/payment?id=${booking.id}`
  const grossAmount = Number(booking.grossAmount || 0).toLocaleString()
  const depositAmount = Number(booking.depositAmount || 0).toLocaleString()
  const dateStr = new Date(booking.date).toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.1)">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#d4af37,#b8941f);padding:30px;text-align:center">
            <h1 style="color:#111;margin:0;font-size:28px;font-weight:900">Nooryi Studio</h1>
            <p style="color:#333;margin:5px 0 0;font-size:14px">منصة حجز الفنانين</p>
          </td>
        </tr>
        <!-- Success Icon -->
        <tr>
          <td style="padding:30px;text-align:center">
            <div style="width:80px;height:80px;background:#10b981;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center">
              <span style="color:white;font-size:40px">✓</span>
            </div>
            <h2 style="color:#111;margin:0 0 10px;font-size:24px">تم تأكيد حجزك! 🎉</h2>
            <p style="color:#666;margin:0;font-size:16px">مرحباً ${booking.clientName || "عميلنا العزيز"}،</p>
            <p style="color:#666;margin:10px 0 0;font-size:14px">يسعدنا إبلاغك بأنه تمت الموافقة على حجزك. يمكنك الآن إكمال الدفع لتأكيد الحجز نهائياً.</p>
          </td>
        </tr>
        <!-- Booking Details -->
        <tr>
          <td style="padding:0 30px">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f0;border-radius:15px;border:2px solid #d4af37">
              <tr><td style="padding:20px">
                <h3 style="color:#111;margin:0 0 15px;font-size:18px;border-bottom:2px solid #d4af37;padding-bottom:10px">تفاصيل الحجز</h3>
                <table width="100%" cellpadding="5" cellspacing="0">
                  <tr><td style="color:#666;padding:8px 0;width:40%">الفنان:</td><td style="font-weight:bold;color:#111;padding:8px 0">${booking.artist?.name || "—"}</td></tr>
                  <tr><td style="color:#666;padding:8px 0">التاريخ:</td><td style="font-weight:bold;color:#111;padding:8px 0">${dateStr}</td></tr>
                  <tr><td style="color:#666;padding:8px 0">الوقت:</td><td style="font-weight:bold;color:#111;padding:8px 0">${booking.timeSlot || "—"}</td></tr>
                  <tr><td style="color:#666;padding:8px 0">المبلغ الإجمالي:</td><td style="font-weight:bold;color:#d4af37;font-size:18px;padding:8px 0">${grossAmount} ج.م</td></tr>
                  <tr><td style="color:#666;padding:8px 0">العربون المطلوب:</td><td style="font-weight:bold;color:#111;padding:8px 0">${depositAmount} ج.م</td></tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>
        <!-- CTA Button -->
        <tr>
          <td style="padding:30px;text-align:center">
            <p style="color:#666;margin:0 0 15px;font-size:14px">لإتمام حجزك، اضغط الزر أدناه لإكمال الدفع</p>
            <a href="${payLink}" style="display:inline-block;background:linear-gradient(135deg,#d4af37,#b8941f);color:#111;padding:16px 50px;text-decoration:none;border-radius:12px;font-weight:900;font-size:18px;box-shadow:0 4px 15px rgba(212,175,55,0.4)">💳 إكمال الدفع الآن</a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#111;padding:20px;text-align:center">
            <p style="color:#666;font-size:12px;margin:0">إذا لم تطلب هذا الحجز، تجاهل هذه الرسالة</p>
            <p style="color:#d4af37;font-size:12px;margin:10px 0 0;font-weight:bold">Nooryi Studio — منصة حجز الفنانين</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export function paymentReceivedAdminTemplate(booking: any, payment: any) {
  return `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#faf8f0;padding:30px;border-radius:20px">
    <div style="text-align:center;margin-bottom:20px"><h1 style="color:#10b981;margin:0">💳 دفع جديد مستلم</h1></div>
    <div style="background:white;padding:20px;border-radius:15px;border:2px solid #10b981;margin-bottom:20px">
      <table style="width:100%"><tr><td style="padding:8px 0;color:#666">العميل:</td><td style="padding:8px 0;font-weight:bold">${booking.clientName}</td></tr>
      <tr><td style="padding:8px 0;color:#666">المبلغ:</td><td style="padding:8px 0;font-weight:bold;color:#10b981">${Number(payment.amount || 0).toLocaleString()} ج.م</td></tr></table>
    </div>
  </div>`
}

export function paymentConfirmedTemplate(booking: any, payment: any) {
  const invoiceLink = `${BASE}/invoice?id=${booking.id}`
  return `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#faf8f0;padding:30px;border-radius:20px">
    <div style="text-align:center;margin-bottom:20px"><h1 style="color:#10b981;margin:0">✅ تم استلام الدفع!</h1></div>
    <div style="background:white;padding:20px;border-radius:15px;border:2px solid #10b981;margin-bottom:20px">
      <table style="width:100%"><tr><td style="padding:8px 0;color:#666">المبلغ:</td><td style="padding:8px 0;font-weight:bold;color:#10b981">${Number(payment.amount || 0).toLocaleString()} ج.م</td></tr>
      <tr><td style="padding:8px 0;color:#666">الفنان:</td><td style="padding:8px 0;font-weight:bold">${booking.artist?.name || "—"}</td></tr></table>
    </div>
    <div style="text-align:center"><a href="${invoiceLink}" style="display:inline-block;background:#111;color:#D4AF37;padding:14px 30px;text-decoration:none;border-radius:10px;font-weight:bold">عرض الفاتورة</a></div>
  </div>`
}