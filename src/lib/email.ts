import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
})

const BASE = process.env.NEXTAUTH_URL || "https://nooryi-studio.vercel.app"

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log("📧 [DEV] Email to:", to, "| Subject:", subject)
      return { success: true, devMode: true }
    }
    const info = await transporter.sendMail({ from: `"Nooryi Studio" <${process.env.EMAIL_USER}>`, to, subject, html })
    console.log("✅ Email sent:", info.messageId)
    return { success: true }
  } catch (error: any) {
    console.error("❌ Email error:", error.message)
    return { success: false, error: error.message }
  }
}

// ═══ 1) إشعار للأدمن عند حجز جديد ═══
export function newBookingAdminTemplate(booking: any) {
  return `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#faf8f0;padding:30px;border-radius:20px">
    <div style="text-align:center;margin-bottom:20px"><h1 style="color:#D4AF37;margin:0"> حجز جديد بانتظار المراجعة</h1></div>
    <div style="background:white;padding:20px;border-radius:15px;border:2px solid #D4AF37;margin-bottom:20px">
      <table style="width:100%"><tr><td style="padding:8px 0;color:#666">العميل:</td><td style="padding:8px 0;font-weight:bold">${booking.clientName}</td></tr>
      <tr><td style="padding:8px 0;color:#666">الهاتف:</td><td style="padding:8px 0" dir="ltr">${booking.clientPhone}</td></tr>
      <tr><td style="padding:8px 0;color:#666">الفنان:</td><td style="padding:8px 0;font-weight:bold">${booking.artist?.name||"—"}</td></tr>
      <tr><td style="padding:8px 0;color:#666">التاريخ:</td><td style="padding:8px 0">${new Date(booking.date).toLocaleDateString("ar-EG")}</td></tr>
      <tr><td style="padding:8px 0;color:#666">المبلغ:</td><td style="padding:8px 0;font-weight:bold;color:#D4AF37">${Number(booking.grossAmount||0).toLocaleString()} ج.م</td></tr></table>
    </div>
    <div style="text-align:center"><a href="${BASE}/admin/bookings/${booking.id}" style="display:inline-block;background:#111;color:#D4AF37;padding:14px 40px;text-decoration:none;border-radius:10px;font-weight:bold">مراجعة الحجز</a></div>
  </div>`
}

// ═══ 2) إشعار للعميل عند الموافقة — إكمال الدفع ═══
export function bookingApprovedTemplate(booking: any) {
  const payLink = `${BASE}/booking/${booking.artist?.slug||"artist"}/payment?id=${booking.id}`
  return `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#faf8f0;padding:30px;border-radius:20px">
    <div style="text-align:center;margin-bottom:20px"><h1 style="color:#D4AF37;margin:0">✅ تم تأكيد حجزك!</h1><p style="color:#666">Nooryi Studio</p></div>
    <div style="background:white;padding:20px;border-radius:15px;border:2px solid #D4AF37;margin-bottom:20px">
      <table style="width:100%"><tr><td style="padding:8px 0;color:#666">الفنان:</td><td style="padding:8px 0;font-weight:bold">${booking.artist?.name||"—"}</td></tr>
      <tr><td style="padding:8px 0;color:#666">التاريخ:</td><td style="padding:8px 0">${new Date(booking.date).toLocaleDateString("ar-EG")}</td></tr>
      <tr><td style="padding:8px 0;color:#666">الإجمالي:</td><td style="padding:8px 0;font-weight:bold;color:#D4AF37">${Number(booking.grossAmount||0).toLocaleString()} ج.م</td></tr>
      <tr><td style="padding:8px 0;color:#666">العربون:</td><td style="padding:8px 0;font-weight:bold">${Number(booking.depositAmount||0).toLocaleString()} ج.م</td></tr></table>
    </div>
    <div style="text-align:center;margin:20px 0"><p style="color:#666">لإتمام حجزك، اضغط الزر أدناه لإكمال الدفع</p>
    <a href="${payLink}" style="display:inline-block;background:linear-gradient(135deg,#D4AF37,#b8941f);color:#111;padding:16px 50px;text-decoration:none;border-radius:12px;font-weight:900;font-size:18px">💳 إكمال الدفع الآن</a></div>
  </div>`
}

// ═══ 3) إشعار للأدمن عند إتمام الدفع ═══
export function paymentReceivedAdminTemplate(booking: any, payment: any) {
  return `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#faf8f0;padding:30px;border-radius:20px">
    <div style="text-align:center;margin-bottom:20px"><h1 style="color:#10b981;margin:0">💳 دفع جديد مستلم</h1></div>
    <div style="background:white;padding:20px;border-radius:15px;border:2px solid #10b981;margin-bottom:20px">
      <table style="width:100%"><tr><td style="padding:8px 0;color:#666">العميل:</td><td style="padding:8px 0;font-weight:bold">${booking.clientName}</td></tr>
      <tr><td style="padding:8px 0;color:#666">الفنان:</td><td style="padding:8px 0;font-weight:bold">${booking.artist?.name||"—"}</td></tr>
      <tr><td style="padding:8px 0;color:#666">المبلغ:</td><td style="padding:8px 0;font-weight:bold;color:#10b981">${Number(payment.amount||0).toLocaleString()} ج.م</td></tr>
      <tr><td style="padding:8px 0;color:#666">رقم العملية:</td><td style="padding:8px 0;font-family:monospace" dir="ltr">${payment.transactionId||"—"}</td></tr></table>
    </div>
    <div style="text-align:center"><a href="${BASE}/admin/bookings/${booking.id}" style="display:inline-block;background:#111;color:#D4AF37;padding:14px 40px;text-decoration:none;border-radius:10px;font-weight:bold">عرض الحجز</a></div>
  </div>`
}

// ═══ 4) إشعار للعميل عند تأكيد الدفع + الفاتورة ═══
export function paymentConfirmedTemplate(booking: any, payment: any) {
  const invoiceLink = `${BASE}/invoice?id=${booking.id}`
  const printLink = `${BASE}/invoice/print?id=${booking.id}`
  return `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#faf8f0;padding:30px;border-radius:20px">
    <div style="text-align:center;margin-bottom:20px">
      <div style="width:70px;height:70px;background:#10b981;border-radius:50%;margin:0 auto 15px;display:flex;align-items:center;justify-content:center"><span style="color:white;font-size:36px">✓</span></div>
      <h1 style="color:#10b981;margin:0">تم استلام الدفع بنجاح! ✅</h1><p style="color:#666">Nooryi Studio</p>
    </div>
    <div style="background:white;padding:20px;border-radius:15px;border:2px solid #10b981;margin-bottom:20px">
      <h2 style="margin-top:0;border-bottom:2px solid #f0f0f0;padding-bottom:10px">إيصال الدفع</h2>
      <table style="width:100%"><tr><td style="padding:8px 0;color:#666">رقم العملية:</td><td style="padding:8px 0;font-family:monospace" dir="ltr">${payment.transactionId||"—"}</td></tr>
      <tr><td style="padding:8px 0;color:#666">المبلغ:</td><td style="padding:8px 0;font-weight:bold;color:#10b981;font-size:18px">${Number(payment.amount||0).toLocaleString()} ج.م</td></tr>
      <tr><td style="padding:8px 0;color:#666">الفنان:</td><td style="padding:8px 0;font-weight:bold">${booking.artist?.name||"—"}</td></tr>
      <tr><td style="padding:8px 0;color:#666">التاريخ:</td><td style="padding:8px 0">${new Date(booking.date).toLocaleDateString("ar-EG")}</td></tr></table>
    </div>
    <div style="background:linear-gradient(135deg,#D4AF37,#b8941f);color:#111;padding:15px;border-radius:15px;text-align:center;margin-bottom:20px">
      <p style="margin:0;font-weight:bold">🎉 تم حجز الفنان بنجاح!</p>
    </div>
    <div style="text-align:center">
      <a href="${printLink}" style="display:inline-block;background:#111;color:#D4AF37;padding:14px 30px;text-decoration:none;border-radius:10px;font-weight:bold;margin:5px">🖨️ طباعة الفاتورة</a>
      <a href="${invoiceLink}" style="display:inline-block;background:white;color:#111;padding:14px 30px;text-decoration:none;border-radius:10px;font-weight:bold;border:2px solid #111;margin:5px">👁️ عرض الفاتورة</a>
    </div>
  </div>`
}