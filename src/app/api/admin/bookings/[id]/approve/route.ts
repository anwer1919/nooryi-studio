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

  try {
    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: { status: "APPROVED" },
      include: {
        artist: true,
        venue: true,
      },
    })

    // إنشاء إشعار للعميل
    if (booking.clientEmail) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: booking.clientEmail },
        })
        
        if (user) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: "تم تأكيد حجزك! 🎉",
              message: `تم تأكيد حجزك للفنان ${booking.artist?.name} بتاريخ ${new Date(booking.date).toLocaleDateString("ar-EG")}. يمكنك الآن إكمال الدفع.`,
              type: "booking_approved",
              link: `/booking/${booking.id}`,
            },
          })
        }
      } catch (error) {
        console.error("Error creating notification:", error)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "تم تأكيد الحجز بنجاح" 
    })
  } catch (error) {
    console.error("Error approving booking:", error)
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}