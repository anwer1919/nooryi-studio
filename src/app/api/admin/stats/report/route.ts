import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get("from")
    const dateTo = searchParams.get("to")

    const userRole = session.user.role || "USER"
    const isManager = userRole === "ARTIST_MANAGER"

    let whereClause: any = {}
    if (isManager) {
      const managerUser = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { artistId: true, name: true },
      })
      if (managerUser?.artistId) {
        whereClause.artistId = managerUser.artistId
      }
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
      include: {
        artist: { select: { name: true, category: true } },
        venue: { select: { name: true } },
      },
    })

    const filtered = bookings.filter((b) => {
      if (!dateFrom && !dateTo) return true
      const bDate = new Date(b.date)
      if (dateFrom && bDate < new Date(dateFrom)) return false
      if (dateTo && bDate > new Date(dateTo)) return false
      return true
    })

    const managerName = isManager 
      ? (await prisma.user.findUnique({ where: { email: session.user.email! }, select: { name: true } }))?.name 
      : "الإدارة العامة"

    return NextResponse.json({ 
      success: true, 
      data: filtered,
      managerName: managerName
    })

  } catch (error: any) {
    console.error("API Report Error:", error.message)
    return NextResponse.json({ success: false, error: "فشل الاتصال بقاعدة البيانات" }, { status: 500 })
  }
}