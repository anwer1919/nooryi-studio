import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { amount, type } = body

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { artist: true },
    })

    if (!booking) {
      return NextResponse.json({ error: "الحجز غير موجود" }, { status: 404 })
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { 
        depositAmount: type === "deposit" ? amount : booking.depositAmount,
        remainingAmount: type === "full" ? 0 : booking.remainingAmount,
        status: type === "full" ? "COMPLETED" : booking.status,
      },
    })

    await prisma.payment.create({
      data: {
        bookingId: id,
        amount,
        status: "COMPLETED",
        method: "CREDIT_CARD",
        confirmedBy: session.user.id,
        confirmedAt: new Date(),
        notes: type === "deposit" ? "دفع العربون" : "الدفع الكامل",
      },
    })

    // إشعار للعميل
    try {
      if (booking.clientEmail) {
        const user = await prisma.user.findUnique({
          where: { email: booking.clientEmail },
        })
        
        if (user) {
          const paymentType = type === "deposit" ? "العربون" : "المبلغ الكامل"
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: `تم تأكيد ${paymentType} ✅`,
              message: `تم تأكيد دفع ${paymentType} بمبلغ ${amount.toLocaleString()} ج.م`,
              type: "payment_confirmed",
              link: `/booking/${id}/invoice`,
            },
          })
        }
      }
    } catch (error) {
      console.error("Notification error:", error)
    }

    return NextResponse.json({ 
      success: true,
      message: `تم تأكيد ${type === "deposit" ? "العربون" : "الدفع الكامل"} بنجاح`
    })
  } catch (error: any) {
    console.error("❌ Confirm payment error:", error)
    return NextResponse.json(
      { error: "حدث خطأ: " + error.message },
      { status: 500 }
    )
  }
}