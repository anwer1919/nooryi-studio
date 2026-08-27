import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  try {
    const [
      totalArtists,
      totalBookings,
      pendingBookings,
      approvedBookings,
      totalUsers,
      totalRevenue,
    ] = await Promise.all([
      prisma.artist.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "PENDING_APPROVAL" } }),
      prisma.booking.count({ where: { status: "APPROVED" } }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.booking.aggregate({
        _sum: { grossAmount: true },
      }),
    ])

    return NextResponse.json({
      totalArtists,
      totalBookings,
      pendingBookings,
      approvedBookings,
      totalUsers,
      totalRevenue: totalRevenue._sum.grossAmount || 0,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}