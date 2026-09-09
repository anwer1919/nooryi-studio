import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json()
    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 })
    }
    if (String(newPassword).length < 6) {
      return NextResponse.json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 })
    }

    const normalizedEmail = String(email).trim().toLowerCase()

    // التحقق من رمز OTP
    const rec = await prisma.verificationToken.findFirst({
      where: { identifier: normalizedEmail },
      orderBy: { createdAt: "desc" },
    })
    const valid = rec && rec.token === String(otp) && rec.expires > new Date()
    if (!valid) {
      return NextResponse.json({ error: "رمز التحقق غير صحيح أو منتهي الصلاحية" }, { status: 401 })
    }

    // إعادة hash كلمة المرور بشكل صحيح بـ bcryptjs
    const hashed = await bcrypt.hash(String(newPassword), 10)
    await prisma.user.update({ where: { email: normalizedEmail }, data: { password: hashed } })
    await prisma.verificationToken.deleteMany({ where: { identifier: normalizedEmail } })

    console.log("✅ [reset-password] password reset OK for:", normalizedEmail)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("❌ [reset-password]", e.message)
    return NextResponse.json({ error: "فشل إعادة التعيين" }, { status: 500 })
  }
}