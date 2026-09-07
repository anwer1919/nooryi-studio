import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, otpEmailTemplate } from "@/lib/email"

// رقم واتساب البزنس
const WHATSAPP_BUSINESS_NUMBER = process.env.WHATSAPP_BUSINESS_NUMBER || "00249998989999"

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

    const sendMethod = method || "email"
    let destination = ""
    let whatsappLink: string | null = null
    let sent = false

    if (sendMethod === "email" && user.email) {
      destination = user.email
      const html = otpEmailTemplate(otp)
      const result = await sendEmail({ to: user.email, subject: "🔐 رمز التحقق — Nooryi Studio", html })
      sent = result.success
      console.log(`🔐 [2FA] OTP=${otp} method=email dest=${user.email} sent=${sent}`)

    } else if (sendMethod === "whatsapp" && user.phone) {
      // واتساب: فتح رابط مباشر برسالة جاهزة
      destination = user.phone
      const phoneClean = user.phone.replace(/[^0-9]/g, "")
      const message = encodeURIComponent(`🔐 رمز التحقق الخاص بك في Nooryi Studio:\n\n${otp}\n\n⏰ صالح لمدة 5 دقائق.\nلا تشاركه مع أي شخص.`)
      whatsappLink = `https://wa.me/${phoneClean}?text=${message}`
      sent = true
      console.log(`🔐 [2FA] OTP=${otp} method=whatsapp dest=${user.phone} link_ready=true`)

    } else if (sendMethod === "sms" && user.phone) {
      // SMS: حالياً نفس رابط واتساب كحل بديل
      // لتفعيل SMS حقيقي: أضف TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN
      destination = user.phone
      const phoneClean = user.phone.replace(/[^0-9]/g, "")
      const message = encodeURIComponent(`رمز التحقق: ${otp} — Nooryi Studio`)
      whatsappLink = `https://wa.me/${phoneClean}?text=${message}`
      sent = true
      console.log(`🔐 [2FA] OTP=${otp} method=sms(fallback-whatsapp) dest=${user.phone}`)

    } else {
      // Fallback: إيميل
      if (user.email) {
        destination = user.email
        const html = otpEmailTemplate(otp)
        const result = await sendEmail({ to: user.email, subject: "🔐 رمز التحقق — Nooryi Studio", html })
        sent = result.success
        console.log(`🔐 [2FA] OTP=${otp} method=email(fallback) dest=${user.email} sent=${sent}`)
      } else {
        return NextResponse.json({ error: "لا يوجد بريد أو هاتف مسجل" }, { status: 400 })
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      method: sendMethod,
      destination: sendMethod === "email"
        ? destination.replace(/(.{2}).+(@.+)/, "$1***$2")
        : destination.replace(/(\d{3})\d+(\d{2})/, "$1****$2"),
      whatsappLink,
      // رابط واتساب بزنس رسمي (للتواصل)
      supportWhatsApp: `https://wa.me/${WHATSAPP_BUSINESS_NUMBER.replace(/[^0-9]/g, "")}`,
    })
  } catch (error: any) {
    console.error("[2FA Error]", error)
    return NextResponse.json({ error: error.message || "فشل إرسال الرمز" }, { status: 500 })
  }
}