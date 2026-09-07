import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, otpEmailTemplate } from "@/lib/email"

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

    if (sendMethod === "email" && user.email) {
      destination = user.email
      const html = otpEmailTemplate(otp)
      const result = await sendEmail({ to: user.email, subject: "🔐 رمز التحقق — Nooryi Studio", html })
      console.log(`🔐 [2FA] OTP=${otp} method=email dest=${user.email} sent=${result.success}`)
    } else if (sendMethod === "whatsapp" && user.phone) {
      destination = user.phone
      whatsappLink = `https://wa.me/${user.phone.replace(/[^0-9]/g, "")}?text=رمز التحقق الخاص بك: ${otp}`
      console.log(`🔐 [2FA] OTP=${otp} method=whatsapp dest=${user.phone}`)
    } else if (sendMethod === "sms" && user.phone) {
      destination = user.phone
      console.log(`🔐 [2FA] OTP=${otp} method=sms dest=${user.phone}`)
    } else {
      if (user.email) {
        destination = user.email
        const html = otpEmailTemplate(otp)
        const result = await sendEmail({ to: user.email, subject: "🔐 رمز التحقق — Nooryi Studio", html })
        console.log(`🔐 [2FA] OTP=${otp} method=email(fallback) dest=${user.email} sent=${result.success}`)
      } else {
        return NextResponse.json({ error: "لا يوجد بريد أو هاتف مسجل" }, { status: 400 })
      }
    }

    return NextResponse.json({
      success: true,
      method: sendMethod,
      destination: sendMethod === "email"
        ? destination.replace(/(.{2}).+(@.+)/, "$1***$2")
        : destination.replace(/(\d{3})\d+(\d{2})/, "$1****$2"),
      whatsappLink,
    })
  } catch (error: any) {
    console.error("[2FA Error]", error)
    return NextResponse.json({ error: error.message || "فشل إرسال الرمز" }, { status: 500 })
  }
}