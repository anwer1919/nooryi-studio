import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const { email, method } = await req.json()
    if (!email) return NextResponse.json({ error: "البريد مطلوب" }, { status: 400 })

    const normalizedEmail = email.trim().toLowerCase()
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) return NextResponse.json({ error: "الحساب غير موجود" }, { status: 404 })

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 5 * 60 * 1000)

    await prisma.verificationToken.deleteMany({ where: { identifier: normalizedEmail } })
    await prisma.verificationToken.create({
      data: { identifier: normalizedEmail, token: otp, expires },
    })

    // تحديد طريقة الإرسال
    const sendMethod = method || (user.phone ? "sms" : "email")
    let destination = ""
    let sent = false

    if (sendMethod === "email") {
      destination = user.email
      const html = `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#faf8f0;padding:30px;border-radius:20px;text-align:center">
        <h1 style="color:#D4AF37;margin-bottom:10px">رمز التحقق</h1>
        <p style="color:#666;margin-bottom:20px">استخدم هذا الرمز لإكمال تسجيل الدخول</p>
        <div style="background:white;padding:20px;border-radius:15px;border:2px solid #D4AF37;margin-bottom:20px">
          <span style="font-size:36px;font-weight:900;letter-spacing:8px;color:#111">${otp}</span>
        </div>
        <p style="color:#999;font-size:12px">هذا الرمز صالح لمدة 5 دقائق. لا تشاركه مع أي شخص.</p>
      </div>`
      const result = await sendEmail({ to: user.email, subject: "🔐 رمز التحقق — Nooryi Studio", html })
      sent = result.success
    } else if (sendMethod === "whatsapp" && user.phone) {
      destination = user.phone
      // WhatsApp عبر رابط مباشر (بدون API مدفوع)
      console.log(`📱 [WhatsApp] OTP for ${normalizedEmail}: ${otp} → ${user.phone}`)
      sent = true // سيتم فتح رابط واتساب من الفرونت إند
    } else if (sendMethod === "sms" && user.phone) {
      destination = user.phone
      console.log(`📧 [SMS] OTP for ${normalizedEmail}: ${otp} → ${user.phone}`)
      sent = true // TODO: تفعيل SMS gateway لاحقاً
    } else {
      // Fallback للإيميل
      destination = user.email
      const html = `<div dir="rtl" style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#faf8f0;padding:30px;border-radius:20px;text-align:center">
        <h1 style="color:#D4AF37;margin-bottom:10px">رمز التحقق</h1>
        <div style="background:white;padding:20px;border-radius:15px;border:2px solid #D4AF37">
          <span style="font-size:36px;font-weight:900;letter-spacing:8px;color:#111">${otp}</span>
        </div>
        <p style="color:#999;font-size:12px;margin-top:15px">صالح لمدة 5 دقائق</p>
      </div>`
      const result = await sendEmail({ to: user.email, subject: "🔐 رمز التحقق — Nooryi Studio", html })
      sent = result.success
    }

    console.log(`🔐 [2FA] OTP=${otp} method=${sendMethod} dest=${destination} sent=${sent}`)

    return NextResponse.json({
      success: true,
      method: sendMethod,
      destination: sendMethod === "email"
        ? destination.replace(/(.{2}).+(@.+)/, "$1***$2")
        : destination.replace(/(\d{3})\d+(\d{2})/, "$1****$2"),
      whatsappLink: sendMethod === "whatsapp" && user.phone
        ? `https://wa.me/${user.phone.replace(/[^0-9]/g, "")}?text=رمز التحقق الخاص بك: ${otp}`
        : null,
    })
  } catch (error: any) {
    console.error("[2FA Error]", error)
    return NextResponse.json({ error: error.message || "فشل إرسال الرمز" }, { status: 500 })
  }
}