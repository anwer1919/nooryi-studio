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

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: { artist: true },
    })

    // إشعار للعميل
    try {
      if (booking.clientEmail) {
        const user = await prisma.user.findUnique({
          where: { email: booking.clientEmail },
        })
        
        if (user) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: "تم رفض الحجز",
              message: `نعتذر، تم رفض حجزك للفنان ${booking.artist?.name}`,
              type: "booking_rejected",
            },
          })
        }
      }
    } catch (error) {
      console.error("Notification error:", error)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("❌ Reject error:", error)
    return NextResponse.json(
      { error: "حدث خطأ: " + error.message },
      { status: 500 }
    )
  }
}