import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const { id } = await params
    const userRole = session.user.role || "USER"
    const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"

    // جلب الحجز مع جميع التفاصيل
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        artist: {
          select: {
            name: true,
            category: true,
            profileImage: true,
            slug: true,
          },
        },
        venue: {
          select: {
            name: true,
            address: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "الحجز غير موجود" }, { status: 404 })
    }

    // التحقق من الصلاحيات
    const isOwner = booking.userId === session.user.id
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
    }

    // حساب المبالغ
    const grossAmount = Number(booking.grossAmount || 0)
    const platformFee = Math.round(grossAmount * 0.05)
    const taxAmount = Math.round(grossAmount * 0.14) // ضريبة القيمة المضافة 14%
    const netAmount = grossAmount - platformFee

    return NextResponse.json({
      success: true,
      data: {
        ...booking,
        grossAmount,
        platformFee,
        taxAmount,
        netAmount,
      },
    })
  } catch (error: any) {
    console.error("Invoice API Error:", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}