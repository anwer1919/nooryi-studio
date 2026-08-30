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

    // جلب الحجز مع التفاصيل المطلوبة (بدون user)
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
        customer: {
          select: {
            fullName: true,
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
    if (!isAdmin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
    }

    // حساب المبالغ بأمان
    const grossAmount = Number(booking.grossAmount || 0)
    const depositAmount = Number(booking.depositAmount || 0)
    const remainingAmount = Number(booking.remainingAmount || 0)
    const platformFee = Math.round(grossAmount * 0.05)
    const taxAmount = Math.round(grossAmount * 0.14)
    const totalWithTax = grossAmount + taxAmount

    // تحديد بيانات العميل من مصادر متعددة
    const clientName =
      booking.customer?.fullName ||
      booking.clientName ||
      "عميل"

    const clientEmail =
      booking.customer?.email ||
      booking.clientEmail ||
      null

    const clientPhone =
      booking.customer?.phone ||
      booking.clientPhone ||
      null

    return NextResponse.json({
      success: true,
      data: {
        ...booking,
        grossAmount,
        depositAmount,
        remainingAmount,
        platformFee,
        taxAmount,
        totalWithTax,
        clientName,
        clientEmail,
        clientPhone,
      },
    })
  } catch (error: any) {
    console.error("Invoice API Error:", error)
    return NextResponse.json(
      { error: error.message || "حدث خطأ في الخادم" },
      { status: 500 }
    )
  }
}