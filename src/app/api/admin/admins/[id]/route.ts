import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isSuperAdmin } from "@/lib/permissions"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || !isSuperAdmin(session.user as any)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // التحقق من أن الحساب ليس سوبر أدمن
    const admin = await prisma.user.findUnique({ where: { id } })
    
    if (!admin) {
      return NextResponse.json({ error: "الأدمن غير موجود" }, { status: 404 })
    }

    if (admin.role === "SUPER_ADMIN") {
      return NextResponse.json({ error: "لا يمكن حذف حساب السوبر أدمن" }, { status: 403 })
    }

    await prisma.user.delete({ where: { id } })

    console.log("✅ Admin deleted:", admin.email)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("❌ Admin DELETE error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}