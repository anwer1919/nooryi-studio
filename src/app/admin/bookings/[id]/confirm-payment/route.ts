import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const userRole = session.user.role || "USER"
    const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }

    const { id } = await params

    // جلب الحجز أولاً لمعرفة المبلغ المتبقي
    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { grossAmount: true, depositAmount: true },
    })

    if (!booking) {
      return NextResponse.redirect(new URL("/admin/bookings", request.url))
    }

    const grossAmount = Number(booking.grossAmount || 0)

    await prisma.booking.update({
      where: { id },
      data: {
        depositAmount: grossAmount,
        remainingAmount: 0,
        status: "CONFIRMED",
      },
    })

    return NextResponse.redirect(new URL(`/admin/bookings/${id}`, request.url))
  } catch (error: any) {
    console.error("Confirm payment error:", error)
    return NextResponse.redirect(new URL("/admin/bookings", request.url))
  }
}