import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail, paymentConfirmedTemplate } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    console.log("💳 === بدء عملية الدفع ===")

    // 1) التحقق من تسجيل الدخول
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      console.error("❌ لا يوجد session")
      return NextResponse.json({ error: "يجب تسجيل الدخول أولاً" }, { status: 401 })
    }

    const userEmail = session.user.email
    const userId = (session.user as any).id
    console.log("👤 User:", userEmail, "ID:", userId)

    // 2) قراءة البيانات
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 })
    }

    const {
      bookingId,
      amount,
      paymentType,
      paymentMethod,
      cardLast4,
      walletNumber,
      walletProvider,
      bankReference,
    } = body

    console.log("📥 Payment data:", { bookingId, amount, paymentType, paymentMethod })

    if (!bookingId || !amount) {
      return NextResponse.json({ error: "بيانات الدفع ناقصة" }, { status: 400 })
    }

    // 3) جلب الحجز
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { artist: true },
    })

    if (!booking) {
      console.error("❌ الحجز غير موجود:", bookingId)
      return NextResponse.json({ error: "الحجز غير موجود" }, { status: 404 })
    }

    // 4) التحقق من الملكية — يقبل email أو userId أو admin
    const userRole = (session.user as any).role || "USER"
    const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
    
    const isOwner = 
      isAdmin ||
      booking.clientEmail === userEmail ||
      booking.userId === userId

    console.log("🔐 Ownership check:", {
      isAdmin,
      emailMatch: booking.clientEmail === userEmail,
      userIdMatch: booking.userId === userId,
      bookingClientEmail: booking.clientEmail,
      bookingUserId: booking.userId,
      sessionEmail: userEmail,
      sessionUserId: userId,
    })

    if (!isOwner) {
      console.error("❌ غير مصرح بالدفع")
      return NextResponse.json({ error: "غير مصرح بهذا الدفع" }, { status: 403 })
    }

    // 5) إنشاء سجل الدفع
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    const methodMap: any = {
      card: "CREDIT_CARD",
      wallet: "MOBILE_WALLET",
      bank: "BANK_TRANSFER",
    }

    const notesParts = []
    notesParts.push(`دفع ${paymentType === "deposit" ? "العربون" : "كامل المبلغ"}`)
    notesParts.push(`عبر ${paymentMethod === "card" ? "بطاقة ****" + (cardLast4 || "") : paymentMethod === "wallet" ? "محفظة " + (walletProvider || "") : "تحويل بنكي"}`)
    if (bankReference) notesParts.push(`مرجع: ${bankReference}`)
    if (walletNumber) notesParts.push(`رقم: ${walletNumber}`)

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount: parseFloat(String(amount)),
        status: "COMPLETED",
        method: methodMap[paymentMethod] || "BANK_TRANSFER",
        transactionId,
        notes: notesParts.join(" — "),
      },
    })

    console.log("✅ Payment created:", payment.id, transactionId)

    // 6) تحديث مبالغ الحجز
    const allPayments = await prisma.payment.findMany({
      where: { bookingId, status: "COMPLETED" },
    })

    const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    const grossAmount = Number(booking.grossAmount || 0)
    const newRemaining = Math.max(0, grossAmount - totalPaid)
    const newStatus = newRemaining === 0 ? "COMPLETED" : "CONFIRMED"

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        depositAmount: totalPaid,
        remainingAmount: newRemaining,
        status: newStatus,
      },
    })

    console.log("✅ Booking updated:", { totalPaid, newRemaining, newStatus })

    // 7) إرسال بريد تأكيد للعميل
    try {
      if (booking.clientEmail) {
        await sendEmail({
          to: booking.clientEmail,
          subject: `✅ تم استلام الدفع — ${booking.artist?.name}`,
          html: paymentConfirmedTemplate(
            { ...booking, artist: booking.artist },
            { transactionId, amount: parseFloat(String(amount)) }
          ),
        })
        console.log("📧 Email sent to:", booking.clientEmail)
      }
    } catch (emailErr) {
      console.warn("⚠️ Email error:", emailErr)
    }

    // 8) إشعار للأدمن
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
            message: `${parseFloat(String(amount)).toLocaleString()} ج.م من ${booking.clientName} — ${booking.artist?.name}`,
            type: "PAYMENT_RECEIVED",
            relatedId: bookingId,
          },
        })
      }
    } catch (notifErr) {
      console.warn("⚠️ Notification error:", notifErr)
    }

    // 9) إرجاع النجاح
    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      transactionId,
      totalPaid,
      remaining: newRemaining,
      status: newStatus,
      message: "تم الدفع بنجاح",
    })

  } catch (error: any) {
    console.error("❌ Payment error:", error)
    return NextResponse.json(
      { error: error.message || "حدث خطأ في عملية الدفع" },
      { status: 500 }
    )
  }
}