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

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    // إذا لم يتم إعداد SMTP، فقط سجل الإيميل (للتطوير)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log("📧 [DEV MODE] Email would be sent to:", to)
      console.log("   Subject:", subject)
      console.log("   To enable emails, add EMAIL_USER and EMAIL_PASSWORD to .env")
      return { success: true, devMode: true }
    }

    const info = await transporter.sendMail({
      from: `"Nooryi Studio" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    })

    console.log("✅ Email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error("❌ Email error:", error.message)
    return { success: false, error: error.message }
  }
}

// ═══════════ Templates ═══════════

export function bookingApprovedTemplate(booking: any) {
  return `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf8f0; padding: 30px; border-radius: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #D4AF37; margin: 0; font-size: 28px;">تم تأكيد حجزك! 🎉</h1>
        <p style="color: #666; margin-top: 10px;">Nooryi Studio</p>
      </div>

      <div style="background: white; padding: 25px; border-radius: 15px; border: 2px solid #D4AF37; margin-bottom: 20px;">
        <h2 style="color: #111; margin-top: 0;">تفاصيل الحجز</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">رقم الحجز:</td>
            <td style="padding: 8px 0; font-weight: bold; text-align: left; font-family: monospace;">${booking.id.slice(0, 12)}...</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">الفنان:</td>
            <td style="padding: 8px 0; font-weight: bold;">${booking.artist?.name || "—"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">التاريخ:</td>
            <td style="padding: 8px 0; font-weight: bold;">${new Date(booking.date).toLocaleDateString("ar-EG")}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">الوقت:</td>
            <td style="padding: 8px 0; font-weight: bold;">${booking.timeSlot}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">المبلغ الإجمالي:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #D4AF37; font-size: 18px;">${Number(booking.grossAmount).toLocaleString()} ج.م</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">العربون المطلوب:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #b8941f;">${Number(booking.depositAmount).toLocaleString()} ج.م</td>
          </tr>
        </table>
      </div>

      <div style="background: #D4AF37; color: #111; padding: 20px; border-radius: 15px; text-align: center; margin-bottom: 20px;">
        <p style="margin: 0 0 15px; font-weight: bold; font-size: 16px;">الخطوة التالية: إتمام الدفع</p>
        <a href="${process.env.NEXTAUTH_URL || "https://nooryi-studio.vercel.app"}/booking/${booking.artist?.slug}/invoice?id=${booking.id}"
           style="display: inline-block; background: #111; color: #D4AF37; padding: 12px 30px; text-decoration: none; border-radius: 10px; font-weight: bold;">
          ادفع الآن
        </a>
      </div>

      <div style="background: white; padding: 20px; border-radius: 15px; border: 1px solid #e8e4d9;">
        <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
          ✅ تم تأكيد حجزك من إدارة المنصة<br>
          💳 يمكنك الآن إتمام دفع العربون لتأكيد الحجز نهائياً<br>
          📧 لأي استفسار، رد على هذا الإيميل
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Nooryi Studio — جميع الحقوق محفوظة</p>
      </div>
    </div>
  `
}

export function paymentConfirmedTemplate(booking: any, payment: any) {
  return `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf8f0; padding: 30px; border-radius: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 80px; height: 80px; background: #10b981; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="color: white; font-size: 40px;">✓</span>
        </div>
        <h1 style="color: #10b981; margin: 0; font-size: 28px;">تم استلام الدفع بنجاح! ✅</h1>
      </div>

      <div style="background: white; padding: 25px; border-radius: 15px; border: 2px solid #10b981; margin-bottom: 20px;">
        <h2 style="color: #111; margin-top: 0;">تفاصيل الدفع</h2>
        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px 0; color: #666;">رقم العملية:</td>
            <td style="padding: 8px 0; font-weight: bold; font-family: monospace; text-align: left;">${payment.transactionId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">المبلغ المدفوع:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #10b981; font-size: 18px;">${Number(payment.amount).toLocaleString()} ج.م</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">الفنان:</td>
            <td style="padding: 8px 0; font-weight: bold;">${booking.artist?.name || "—"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">التاريخ:</td>
            <td style="padding: 8px 0;">${new Date(booking.date).toLocaleDateString("ar-EG")}</td>
          </tr>
        </table>
      </div>

      <div style="background: #fef3c7; border: 2px solid #D4AF37; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
        <p style="margin: 0; color: #92400e; font-weight: bold;">
          🎉 تم حجز الفنان بنجاح!<br>
          <span style="font-weight: normal; color: #78350f;">سيتواصل معك الفريق قريباً لتأكيد التفاصيل النهائية.</span>
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXTAUTH_URL || "https://nooryi-studio.vercel.app"}/booking/${booking.artist?.slug}/invoice?id=${booking.id}"
           style="display: inline-block; background: #D4AF37; color: #111; padding: 12px 30px; text-decoration: none; border-radius: 10px; font-weight: bold;">
          عرض الفاتورة
        </a>
      </div>

      <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Nooryi Studio</p>
      </div>
    </div>
  `
}