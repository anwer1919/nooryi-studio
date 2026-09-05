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
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log("📧 [DEV MODE] Email would be sent to:", to)
      console.log("   Subject:", subject)
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

// ═══════════════════════════════════════════════════
// Template 1: عند موافقة الأدمن — زر "إكمال الدفع"
// ═══════════════════════════════════════════════════
export function bookingApprovedTemplate(booking: any) {
  const baseUrl = process.env.NEXTAUTH_URL || "https://nooryi-studio.vercel.app"
  const paymentLink = `${baseUrl}/booking/${booking.artist?.slug}/payment?id=${booking.id}`
  
  return `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf8f0; padding: 30px; border-radius: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #D4AF37, #b8941f); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="color: #111; font-size: 32px; font-weight: 900;">N</span>
        </div>
        <h1 style="color: #D4AF37; margin: 0; font-size: 28px;">تم تأكيد حجزك! 🎉</h1>
        <p style="color: #666; margin-top: 10px;">Nooryi Studio</p>
      </div>

      <div style="background: white; padding: 25px; border-radius: 15px; border: 2px solid #D4AF37; margin-bottom: 20px;">
        <h2 style="color: #111; margin-top: 0; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">تفاصيل الحجز</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #666; width: 40%;">رقم الحجز:</td>
            <td style="padding: 10px 0; font-weight: bold; text-align: left; font-family: monospace;">${booking.id.slice(0, 12)}...</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666;">الفنان:</td>
            <td style="padding: 10px 0; font-weight: bold; font-size: 16px;">${booking.artist?.name || "—"}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666;">التاريخ:</td>
            <td style="padding: 10px 0; font-weight: bold;">${new Date(booking.date).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666;">الفترة:</td>
            <td style="padding: 10px 0; font-weight: bold;">${booking.timeSlot}</td>
          </tr>
          ${booking.region ? `
          <tr>
            <td style="padding: 10px 0; color: #666;">المنطقة:</td>
            <td style="padding: 10px 0; font-weight: bold;">${booking.region}</td>
          </tr>
          ` : ""}
        </table>
      </div>

      <div style="background: #111; color: white; padding: 25px; border-radius: 15px; margin-bottom: 20px;">
        <h3 style="color: #D4AF37; margin-top: 0;">💰 تفاصيل المبلغ</h3>
        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px 0; color: #ccc;">المبلغ الإجمالي:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #D4AF37; font-size: 18px; text-align: left;">${Number(booking.grossAmount).toLocaleString()} ج.م</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #ccc;">العربون المطلوب:</td>
            <td style="padding: 8px 0; font-weight: bold; color: white; font-size: 16px; text-align: left;">${Number(booking.depositAmount).toLocaleString()} ج.م</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #ccc;">المتبقي:</td>
            <td style="padding: 8px 0; font-weight: bold; color: white; text-align: left;">${Number(booking.remainingAmount || booking.grossAmount - booking.depositAmount).toLocaleString()} ج.م</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          لإتمام حجزك، اضغط الزر أدناه لإكمال الدفع
        </p>
        <a href="${paymentLink}"
           style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #b8941f); color: #111; padding: 18px 50px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 18px; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);">
          💳 إكمال الدفع الآن
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 15px;">
          أو انسخ هذا الرابط: <br>
          <span style="font-family: monospace; background: #f0f0f0; padding: 5px 10px; border-radius: 5px; word-break: break-all;">${paymentLink}</span>
        </p>
      </div>

      <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 10px; margin-top: 20px;">
        <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
          💡 <strong>ملاحظة:</strong> يمكنك دفع العربون فقط لتأكيد الحجز، أو دفع كامل المبلغ.
          بعد إتمام الدفع، ستتلقى فاتورة رسمية قابلة للطباعة.
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #999; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Nooryi Studio — جميع الحقوق محفوظة</p>
        <p style="margin-top: 5px;">
          للاستفسار: <a href="mailto:info@noorystudio.com" style="color: #D4AF37;">info@noorystudio.com</a>
        </p>
      </div>
    </div>
  `
}

// ═══════════════════════════════════════════════════
// Template 2: بعد الدفع — زر "طباعة الفاتورة"
// ═══════════════════════════════════════════════════
export function paymentConfirmedTemplate(booking: any, payment: any) {
  const baseUrl = process.env.NEXTAUTH_URL || "https://nooryi-studio.vercel.app"
  const printLink = `${baseUrl}/invoice/print?id=${booking.id}`
  const invoiceLink = `${baseUrl}/invoice?id=${booking.id}`
  
  return `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf8f0; padding: 30px; border-radius: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="width: 80px; height: 80px; background: #10b981; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="color: white; font-size: 40px;">✓</span>
        </div>
        <h1 style="color: #10b981; margin: 0; font-size: 28px;">تم استلام الدفع بنجاح! ✅</h1>
        <p style="color: #666; margin-top: 10px;">Nooryi Studio</p>
      </div>

      <div style="background: white; padding: 25px; border-radius: 15px; border: 2px solid #10b981; margin-bottom: 20px;">
        <h2 style="color: #111; margin-top: 0; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">إيصال الدفع</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #666; width: 40%;">رقم العملية:</td>
            <td style="padding: 10px 0; font-weight: bold; text-align: left; font-family: monospace;">${payment.transactionId || "TXN-" + Date.now()}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666;">المبلغ المدفوع:</td>
            <td style="padding: 10px 0; font-weight: bold; color: #10b981; font-size: 20px; text-align: left;">${Number(payment.amount).toLocaleString()} ج.م</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666;">الفنان:</td>
            <td style="padding: 10px 0; font-weight: bold;">${booking.artist?.name || "—"}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666;">التاريخ:</td>
            <td style="padding: 10px 0;">${new Date(booking.date).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666;">تاريخ الدفع:</td>
            <td style="padding: 10px 0;">${new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
          </tr>
        </table>
      </div>

      <div style="background: linear-gradient(135deg, #D4AF37, #b8941f); color: #111; padding: 20px; border-radius: 15px; text-align: center; margin-bottom: 20px;">
        <p style="margin: 0; font-weight: bold; font-size: 16px;">🎉 تم حجز الفنان بنجاح!</p>
        <p style="margin: 5px 0 0; font-size: 14px;">سيتواصل معك الفريق قريباً لتأكيد التفاصيل.</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          يمكنك طباعة فاتورتك الرسمية الآن
        </p>
        <a href="${printLink}"
           style="display: inline-block; background: #111; color: #D4AF37; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 16px; margin: 5px;">
          🖨️ طباعة الفاتورة
        </a>
        <a href="${invoiceLink}"
           style="display: inline-block; background: white; color: #111; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 16px; border: 2px solid #111; margin: 5px;">
          👁️ عرض الفاتورة
        </a>
      </div>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #999; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Nooryi Studio — جميع الحقوق محفوظة</p>
      </div>
    </div>
  `
}