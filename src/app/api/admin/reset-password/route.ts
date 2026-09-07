import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
    }

    const { userId, newPassword } = await req.json()
    if (!userId || !newPassword) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    })

    console.log("🔑 Password reset for user:", userId, "by admin:", (session.user as any).email)
    return NextResponse.json({ success: true, message: "تم إعادة تعيين كلمة المرور بنجاح" })
  } catch (error: any) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: error.message || "فشل إعادة التعيين" }, { status: 500 })
  }
}