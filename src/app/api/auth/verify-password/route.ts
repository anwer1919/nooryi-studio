import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    if (!user || !user.password) {
      return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة" }, { status: 401 })
    }

    const isHashed = user.password.startsWith("$2a$") || user.password.startsWith("$2b$") || user.password.startsWith("$2y$")
    const ok = isHashed ? await bcrypt.compare(password, user.password) : password === user.password

    if (!ok) {
      return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة" }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[verify-password]", error.message)
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 })
  }
}