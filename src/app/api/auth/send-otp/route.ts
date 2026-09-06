import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: "البريد مطلوب" }, { status: 400 })

    // توليد رمز OTP من 6 أرقام
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 10 * 60 * 1000) // صالح لمدة 10 دقائق

    // حذف الرموز القديمة لنفس البريد
    await prisma.verificationToken.deleteMany({ where: { identifier: email.toLowerCase() } })

    // إنشاء رمز جديد
    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token: otp,
        expires,
      },
    })

    // طباعة الرمز في الـ logs (للتجربة بدون بريد حقيقي)
    console.log(`📧 [OTP] Code for ${email}: ${otp}`)

    // TODO: إرسال البريد الإلكتروني الحقيقي هنا لاحقاً
    // await transporter.sendMail({ to: email, subject: "رمز التحقق", html: `<h1>${otp}</h1>` })

    return NextResponse.json({ success: true, message: "تم إرسال رمز التحقق" })
  } catch (error: any) {
    console.error("[OTP Error]", error)
    return NextResponse.json({ error: error.message || "فشل إرسال الرمز" }, { status: 500 })
  }
}