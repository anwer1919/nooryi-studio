import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json()
    if (!email || !otp) return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 })

    const normalizedEmail = email.trim().toLowerCase()

    // البحث عن الرمز
    const token = await prisma.verificationToken.findFirst({
      where: {
        identifier: normalizedEmail,
        token: otp,
        expires: { gt: new Date() },
      },
    })

    if (!token) {
      return NextResponse.json({ error: "رمز غير صحيح أو منتهي الصلاحية" }, { status: 401 })
    }

    // حذف الرمز بعد الاستخدام (لمرة واحدة فقط)
    await prisma.verificationToken.deleteMany({ where: { identifier: normalizedEmail } })

    return NextResponse.json({ verified: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}