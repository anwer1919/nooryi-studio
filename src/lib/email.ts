import nodemailer from "nodemailer"

const FROM_NAME = process.env.EMAIL_FROM_NAME || "Nooryi Studio"

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error("❌ [EMAIL] NOT CONFIGURED — set EMAIL_USER and EMAIL_PASSWORD in Vercel env")
    return { success: false, error: "EMAIL_NOT_CONFIGURED" }
  }
  try {
    const port = Number(process.env.EMAIL_PORT || 587)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port,
      secure: port === 465,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
    })
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    })
    console.log("✅ [EMAIL] sent:", info.messageId, "→", to)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error("❌ [EMAIL] failed:", error.message, "| code:", error.code, "| to:", to)
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

export function bookingConfirmationTemplate(b: any) {
  const total = Number(b.grossAmount || 0).toLocaleString()
  const deposit = Number(b.depositAmount || 0).toLocaleString()
  const dateStr = b.date ? new Date(b.date).toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "—"
  const timeLabels: Record<string, string> = { MORNING: "صباحاً", AFTERNOON: "ظهراً", EVENING: "مساءً", NIGHT: "ليلاً" }
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
        <tr><td style="padding:8px 0;color:#888">التاريخ:</td><td style="padding:8px 0;font-weight:bold">${dateStr}</td></tr>
        <tr><td style="padding:8px 0;color:#888">الوقت:</td><td style="padding:8px 0;font-weight:bold">${timeLabels[b.timeSlot] || b.timeSlot || "—"}</td></tr>
        <tr><td style="padding:8px 0;color:#888">المكان:</td><td style="padding:8px 0;font-weight:bold">${b.venue?.name || "سيتم تحديده"}</td></tr>
        <tr><td style="padding:8px 0;color:#888">الإجمالي:</td><td style="padding:8px 0;font-weight:bold;color:#b8941f">${total} ج.م</td></tr>
        <tr><td style="padding:8px 0;color:#888">العربون:</td><td style="padding:8px 0;font-weight:bold">${deposit} ج.م</td></tr>
      </table>
    </div>
    <p style="color:#999;font-size:12px;text-align:center;margin-top:16px">لأي استفسار تواصل معنا عبر المنصة</p>
  </div>`
}

export function bookingRejectionTemplate(b: any) {
  const dateStr = b.date ? new Date(b.date).toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "—"
  return `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#faf8f0;padding:30px;border-radius:20px;text-align:center">
    <div style="background:#dc2626;padding:18px;border-radius:15px;margin-bottom:18px"><h1 style="color:#fff;margin:0;font-size:20px">❌ اعتذار عن الحجز</h1></div>
    <div style="background:#fff;padding:24px;border-radius:15px;border:2px solid #e5e7eb">
      <p style="color:#333;font-size:15px">مرحباً <b>${b.clientName || "عميلنا العزيز"}</b>،</p>
      <p style="color:#666;font-size:14px">نعتذر، تعذر تأكيد حجزك بتاريخ ${dateStr}. يمكنك اختيار موعد آخر أو فنان آخر من المنصة.</p>
    </div>
  </div>`
}

export function paymentReceiptTemplate(b: any, amount: number, type: string) {
  const dateStr = b.date ? new Date(b.date).toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "—"
  return `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#faf8f0;padding:30px;border-radius:20px;text-align:center">
    <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:18px;border-radius:15px;margin-bottom:18px"><h1 style="color:#fff;margin:0;font-size:20px">💳 تم استلام الدفعة</h1></div>
    <div style="background:#fff;padding:24px;border-radius:15px;border:2px solid #16a34a">
      <p style="color:#333;font-size:15px">مرحباً <b>${b.clientName || "عميلنا العزيز"}</b>،</p>
      <p style="color:#666;font-size:14px">تم تأكيد استلام ${type === "full" ? "المبلغ الكامل" : "العربون"} بقيمة <b style="color:#16a34a">${Number(amount).toLocaleString()} ج.م</b> لحجزك بتاريخ ${dateStr}.</p>
    </div>
  </div>`
}