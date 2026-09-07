import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json()
    if (!email || !otp) return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 })

    const token = await prisma.verificationToken.findFirst({
      where: {
        identifier: email.trim().toLowerCase(),
        token: otp,
        expires: { gt: new Date() },
      },
    })

    if (!token) return NextResponse.json({ error: "رمز غير صحيح أو منتهي الصلاحية" }, { status: 401 })

    await prisma.verificationToken.deleteMany({ where: { identifier: email.trim().toLowerCase() } })

    return NextResponse.json({ verified: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}