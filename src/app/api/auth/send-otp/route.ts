import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: "البريد مطلوب" }, { status: 400 })

    const normalizedEmail = email.trim().toLowerCase()

    // التحقق من وجود المستخدم
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) return NextResponse.json({ error: "الحساب غير موجود" }, { status: 404 })

    // توليد رمز OTP من 6 أرقام
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 5 * 60 * 1000) // صالح 5 دقائق

    // حذف الرموز القديمة
    await prisma.verificationToken.deleteMany({ where: { identifier: normalizedEmail } })

    // إنشاء رمز جديد
    await prisma.verificationToken.create({
      data: { identifier: normalizedEmail, token: otp, expires },
    })

    // تحديد وجهة الإرسال (إيميل أو هاتف)
    const destination = user.phone || user.email
    const method = user.phone ? "phone" : "email"

    console.log(`🔐 [2FA] OTP for ${normalizedEmail}: ${otp} (sent via ${method} to ${destination})`)

    // TODO: تفعيل إرسال SMS/Email الحقيقي لاحقاً
    // if (method === "email") { await sendEmail(destination, otp) }
    // if (method === "phone") { await sendSMS(destination, otp) }

    return NextResponse.json({
      success: true,
      method,
      destination: method === "phone"
        ? destination.replace(/(\d{3})\d+(\d{2})/, "$1****$2")
        : destination.replace(/(.{2}).+(@.+)/, "$1***$2"),
    })
  } catch (error: any) {
    console.error("[2FA Error]", error)
    return NextResponse.json({ error: error.message || "فشل إرسال الرمز" }, { status: 500 })
  }
}