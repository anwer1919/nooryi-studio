import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
    }

    const { id } = await params
    const { role } = await req.json()

    const validRoles = ["USER", "ADMIN", "ARTIST_MANAGER"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "دور غير صالح" }, { status: 400 })
    }

    // منع تغيير دور سوبر أدمن آخر
    const targetUser = await prisma.user.findUnique({ where: { id } })
    if (targetUser?.role === "SUPER_ADMIN") {
      return NextResponse.json({ error: "لا يمكن تغيير دور المدير العام" }, { status: 403 })
    }

    await prisma.user.update({
      where: { id },
      data: { role },
    })

    console.log("🛡️ Role changed for user:", id, "to:", role, "by:", (session.user as any).email)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}