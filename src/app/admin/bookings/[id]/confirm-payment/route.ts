import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  const body = await request.json()
  const { amount, type } = body // type: "deposit" or "full"

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { artist: true },
    })

    if (!booking) {
      return NextResponse.json({ error: "الحجز غير موجود" }, { status: 404 })
    }

    // تحديث حالة الحجز
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: { 
        depositAmount: type === "deposit" ? amount : booking.depositAmount,
        remainingAmount: type === "full" ? 0 : booking.remainingAmount,
        status: type === "full" ? "COMPLETED" : booking.status,
      },
    })

    // إشعار للعميل
    if (booking.clientEmail) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: booking.clientEmail },
        })
        
        if (user) {
          const paymentType = type === "deposit" ? "العربون" : "المبلغ الكامل"
          
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: `تم تأكيد ${paymentType} ✅`,
              message: `تم تأكيد دفع ${paymentType} بمبلغ ${amount.toLocaleString()} ج.م لحجزك مع ${booking.artist?.name}. يمكنك الآن طباعة الفاتورة.`,
              type: "payment_confirmed",
              link: `/booking/${booking.id}/invoice`,
            },
          })
        }
      } catch (error) {
        console.error("Error creating notification:", error)
      }
    }

    return NextResponse.json({ 
      success: true,
      message: `تم تأكيد ${type === "deposit" ? "العربون" : "الدفع الكامل"} بنجاح`
    })
  } catch (error) {
    console.error("Error confirming payment:", error)
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}