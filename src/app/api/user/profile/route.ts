import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
export const dynamic = "force-dynamic"
export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "غير مسجل الدخول" }, { status: 401 })
    const id = (session.user as any).id
    const body = await req.json()
    const data: any = {}
    if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim()
    if (typeof body.phone === "string") data.phone = body.phone.trim() || null
    if (body.newPassword) {
      if (!body.currentPassword) return NextResponse.json({ error: "أدخل كلمة المرور الحالية" }, { status: 400 })
      const user = await prisma.user.findUnique({ where: { id } })
      if (!user?.password) return NextResponse.json({ error: "لا يمكن تغيير كلمة مرور هذا الحساب" }, { status: 400 })
      const isHashed = user.password.startsWith("$2")
      const ok = isHashed ? await bcrypt.compare(String(body.currentPassword), user.password) : String(body.currentPassword) === user.password
      if (!ok) return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 401 })
      if (String(body.newPassword).length < 6) return NextResponse.json({ error: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" }, { status: 400 })
      data.password = await bcrypt.hash(String(body.newPassword), 10)
    }
    if (Object.keys(data).length === 0) return NextResponse.json({ error: "لا توجد بيانات للتحديث" }, { status: 400 })
    await prisma.user.update({ where: { id }, data })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("[profile]", e.message)
    return NextResponse.json({ error: "فشل تحديث البيانات" }, { status: 500 })
  }
}
