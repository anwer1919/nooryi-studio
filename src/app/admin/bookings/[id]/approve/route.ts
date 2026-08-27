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
    console.log("✅ Approving booking:", id)

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: "APPROVED" },
      include: { artist: true },
    })

    // إنشاء إشعار للعميل
    try {
      if (booking.clientEmail) {
        const user = await prisma.user.findUnique({
          where: { email: booking.clientEmail },
        })
        
        if (user) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: "تم تأكيد حجزك! 🎉",
              message: `تم تأكيد حجزك للفنان ${booking.artist?.name}`,
              type: "booking_approved",
              link: `/booking/${booking.id}`,
            },
          })
        }
      }
    } catch (error) {
      console.error("Notification error:", error)
    }

    return NextResponse.json({ 
      success: true, 
      message: "تم تأكيد الحجز بنجاح" 
    })
  } catch (error: any) {
    console.error("❌ Approve error:", error)
    return NextResponse.json(
      { error: "حدث خطأ: " + error.message },
      { status: 500 }
    )
  }
}