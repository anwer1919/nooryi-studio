import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, amount, paymentType, paymentMethod, cardLast4, walletNumber, bankReference } = body

    // جلب الحجز
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { artist: true },
    })

    if (!booking) {
      return NextResponse.json({ error: "الحجز غير موجود" }, { status: 404 })
    }

    // التحقق من الملكية
    if (booking.clientEmail !== session.user.email) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
    }

    // إنشاء سجل الدفع
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount,
        status: "PENDING",
        method: paymentMethod === "card" ? "CREDIT_CARD" : 
                paymentMethod === "wallet" ? "MOBILE_WALLET" : "BANK_TRANSFER",
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        notes: `دفع ${paymentType === "deposit" ? "العربون" : "كامل المبلغ"} عبر ${paymentMethod === "card" ? "بطاقة" : paymentMethod === "wallet" ? "محفظة" : "تحويل بنكي"}`,
      },
    })

    // تحديث الحجز
    const grossAmount = booking.grossAmount || 0
    let newDeposit = booking.depositAmount || 0
    let newRemaining = booking.remainingAmount || grossAmount
    
    if (paymentType === "deposit") {
      newDeposit = amount
      newRemaining = grossAmount - amount
    } else if (paymentType === "full") {
      newDeposit = grossAmount
      newRemaining = 0
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        depositAmount: newDeposit,
        remainingAmount: newRemaining,
      },
    })

    // إنشاء إشعار للأدمن
    try {
      const admins = await prisma.user.findMany({
        where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } },
        select: { id: true },
      })

      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: "💳 دفع جديد مستلم",
            message: `دفع ${amount.toLocaleString()} ج.م من ${booking.clientName} لحجز ${booking.artist?.name}`,
            type: "new_payment",
            link: `/admin/bookings/${bookingId}`,
          },
        })
      }
    } catch (error) {
      console.error("Notification error:", error)
    }

    return NextResponse.json({
      success: true,
      message: "تم استلام الدفع بنجاح",
      payment: {
        id: payment.id,
        amount,
        transactionId: payment.transactionId,
      },
    })
  } catch (error: any) {
    console.error("Payment error:", error)
    return NextResponse.json(
      { error: "حدث خطأ في عملية الدفع: " + error.message },
      { status: 500 }
    )
  }
}