import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { notifyAdmins } from "@/lib/notifications"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bookingId, amount, type, method } = body

    if (!bookingId || !amount || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // التحقق من وجود الحجز
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { artist: true, customer: true }
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // محاكاة عملية الدفع (في الإنتاج سيتم الربط مع Paymob)
    // هنا نفترض أن الدفع نجح دائماً
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // إنشاء سجل الدفع
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount,
        type,
        status: "PAID",
        transactionId,
      }
    })

    // تحديث حالة الحجز
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "APPROVED",
        depositAmount: amount,
      }
    })

    // تحديث حالة الموعد إلى BOOKED
    await prisma.availability.updateMany({
      where: {
        artistId: booking.artistId,
        date: booking.date,
        timeSlot: booking.timeSlot,
      },
      data: { status: "BOOKED" }
    })

    // إرسال إشعار للأدمن
    await notifyAdmins(
      "💰 دفعة جديدة",
      `تم استلام دفعة ${amount} ج.م لحجز ${booking.artist.name} - العميل: ${booking.clientName}`
    )

    // إرسال إشعار للعميل (إن كان مسجلاً)
    if (booking.customer?.userId) {
      await prisma.notification.create({
        data: {
          userId: booking.customer.userId,
          title: "💳 تم تأكيد الدفع",
          message: `تم استلام دفعتك بنجاح. حجزك للفنان ${booking.artist.name} مؤكد الآن.`,
        }
      })
    }

    return NextResponse.json({
      success: true,
      payment,
      transactionId,
    }, { status: 201 })
  } catch (error: any) {
    console.error("❌ Payment error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}