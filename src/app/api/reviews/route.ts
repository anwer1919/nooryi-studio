import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { bookingId, rating, comment } = body

    // التحقق من البيانات
    if (!bookingId || !rating) {
      return NextResponse.json({ error: "الحجز والتقييم مطلوبان" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "التقييم يجب أن يكون بين 1 و 5" }, { status: 400 })
    }

    // التحقق من وجود الحجز
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { artist: true, review: true }
    })

    if (!booking) {
      return NextResponse.json({ error: "الحجز غير موجود" }, { status: 404 })
    }

    // التحقق من أن الحجز مكتمل أو مؤكد
    if (!["APPROVED", "COMPLETED"].includes(booking.status)) {
      return NextResponse.json({ error: "لا يمكن تقييم حجز غير مكتمل" }, { status: 400 })
    }

    // التحقق من عدم وجود تقييم مسبق
    if (booking.review) {
      return NextResponse.json({ error: "تم تقييم هذا الحجز مسبقاً" }, { status: 400 })
    }

    // التحقق من ملكية الحجز
    let customerId = null
    let clientName = booking.clientName

    if (session?.user) {
      const userId = (session.user as any).id
      const customer = await prisma.customer.findUnique({ where: { userId } })
      
      if (customer) {
        customerId = customer.id
        
        // التحقق من أن الحجز يخص هذا العميل
        if (booking.customerId !== customer.id) {
          const customerCleanPhone = customer.phone?.replace(/[^0-9]/g, "")
          const bookingCleanPhone = booking.clientPhone?.replace(/[^0-9]/g, "")
          
          if (!customerCleanPhone || !bookingCleanPhone?.includes(customerCleanPhone)) {
            return NextResponse.json({ error: "لا يمكنك تقييم حجز لا يخصك" }, { status: 403 })
          }
        }
        
        clientName = customer.fullName
      }
    }

    // إنشاء التقييم
    const review = await prisma.review.create({
      data: {
        bookingId,
        artistId: booking.artistId,
        customerId,
        rating,
        comment: comment || null,
        clientName,
      },
      include: {
        artist: { select: { name: true, slug: true } }
      }
    })

    console.log("✅ Review created:", review.id)
    return NextResponse.json(review, { status: 201 })
  } catch (error: any) {
    console.error("❌ Review error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}