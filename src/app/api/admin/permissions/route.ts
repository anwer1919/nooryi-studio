import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
    }

    const { userId, permissions } = await request.json()

    if (!userId || !Array.isArray(permissions)) {
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: userId },
      data: { permissions },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Permissions API Error:", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}