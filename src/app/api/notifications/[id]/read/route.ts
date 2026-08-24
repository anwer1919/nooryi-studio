import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const userId = (session.user as any).id

    const notification = await prisma.notification.update({
      where: { 
        id,
        userId,
      },
      data: { isRead: true },
    })

    return NextResponse.json(notification)
  } catch (error: any) {
    console.error("❌ Mark read error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// تحديد جميع الإشعارات كمقروءة
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("❌ Mark all read error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}