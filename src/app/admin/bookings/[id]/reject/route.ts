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
      data: { status: "CANCELLED" },
      include: { artist: true },
    })

    // إشعار للعميل
    if (booking.clientEmail) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: booking.clientEmail },
        })
        
        if (user) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: "تم رفض الحجز",
              message: `نعتذر، تم رفض حجزك للفنان ${booking.artist?.name}. يمكنك البحث عن فنان آخر.`,
              type: "booking_rejected",
            },
          })
        }
      } catch (error) {
        console.error("Error creating notification:", error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}