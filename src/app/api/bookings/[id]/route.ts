import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        artist: { select: { name: true, category: true } },
        venue: { select: { name: true, address: true, city: true } },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "غير موجود" }, { status: 404 })
    }

    // التحقق من الصلاحيات
    const isOwner = booking.clientEmail === session.user.email
    const isAdmin = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN"

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 })
  }
}