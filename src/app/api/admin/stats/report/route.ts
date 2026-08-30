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
    const statusFilter = searchParams.get("status") // COMPLETED, APPROVED, CANCELLED, PENDING_APPROVAL
    const paymentFilter = searchParams.get("payment") // PAID, UNPAID, PARTIAL
    const artistFilter = searchParams.get("artist")
    const saveReport = searchParams.get("save") === "true"

    const userRole = session.user.role || "USER"
    const isManager = userRole === "ARTIST_MANAGER"

    let whereClause: any = {}
    if (isManager) {
      const managerUser = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { artistId: true },
      })
      if (managerUser?.artistId) {
        whereClause.artistId = managerUser.artistId
      }
    }

    // فلترة حسب التاريخ
    if (dateFrom || dateTo) {
      whereClause.date = {}
      if (dateFrom) whereClause.date.gte = new Date(dateFrom)
      if (dateTo) whereClause.date.lte = new Date(dateTo + "T23:59:59")
    }

    // فلترة حسب الحالة
    if (statusFilter && statusFilter !== "ALL") {
      whereClause.status = statusFilter
    }

    // فلترة حسب الفنان
    if (artistFilter && artistFilter !== "ALL") {
      whereClause.artistId = artistFilter
    }

    let bookings = await prisma.booking.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
      include: {
        artist: { select: { id: true, name: true, category: true } },
        venue: { select: { name: true } },
      },
    })

    // فلترة حسب حالة الدفع (منطق مخصص)
    if (paymentFilter && paymentFilter !== "ALL") {
      bookings = bookings.filter((b) => {
        const remaining = Number(b.remainingAmount || 0)
        const deposit = Number(b.depositAmount || 0)
        
        if (paymentFilter === "PAID") return remaining === 0 && deposit > 0
        if (paymentFilter === "PARTIAL") return deposit > 0 && remaining > 0
        if (paymentFilter === "UNPAID") return deposit === 0
        return true
      })
    }

    // حساب الإجماليات
    const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.grossAmount || 0), 0)
    const totalDeposits = bookings.reduce((sum, b) => sum + Number(b.depositAmount || 0), 0)
    const totalRemaining = bookings.reduce((sum, b) => sum + Number(b.remainingAmount || 0), 0)
    const platformFee = Math.round(totalRevenue * 0.05)
    const netRevenue = totalRevenue - platformFee

    // إحصائيات حسب الحالة
    const statsByStatus = {
      completed: bookings.filter(b => b.status === "COMPLETED").length,
      approved: bookings.filter(b => b.status === "APPROVED").length,
      pending: bookings.filter(b => b.status === "PENDING_APPROVAL").length,
      cancelled: bookings.filter(b => b.status === "CANCELLED").length,
    }

    // إحصائيات حسب حالة الدفع
    const statsByPayment = {
      paid: bookings.filter(b => Number(b.remainingAmount || 0) === 0 && Number(b.depositAmount || 0) > 0).length,
      partial: bookings.filter(b => Number(b.depositAmount || 0) > 0 && Number(b.remainingAmount || 0) > 0).length,
      unpaid: bookings.filter(b => Number(b.depositAmount || 0) === 0).length,
    }

    // إحصائيات حسب الفنان
    const statsByArtist: any = {}
    bookings.forEach((b) => {
      const artistName = b.artist?.name || "غير محدد"
      if (!statsByArtist[artistName]) {
        statsByArtist[artistName] = { count: 0, revenue: 0 }
      }
      statsByArtist[artistName].count++
      statsByArtist[artistName].revenue += Number(b.grossAmount || 0)
    })

    const managerName = isManager
      ? (await prisma.user.findUnique({ where: { email: session.user.email! }, select: { name: true } }))?.name
      : "الإدارة العامة"

    // قائمة الفنانين للفلتر
    const artists = await prisma.artist.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })

    const reportData = {
      success: true,
      data: bookings,
      managerName,
      artists,
      stats: {
        totalRevenue,
        totalDeposits,
        totalRemaining,
        platformFee,
        netRevenue,
        totalBookings: bookings.length,
        byStatus: statsByStatus,
        byPayment: statsByPayment,
        byArtist: statsByArtist,
      },
    }

    // حفظ التقرير في قاعدة البيانات إذا طُلب ذلك
    if (saveReport) {
      const reportNumber = `RPT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`
      
      await prisma.generatedReport.create({
        data: {
          reportNumber,
          type: "REPORT",
          title: "تقرير مالي شامل",
          generatedFor: managerName || "الإدارة العامة",
          dateFrom: dateFrom ? new Date(dateFrom) : null,
          dateTo: dateTo ? new Date(dateTo) : null,
          totalAmount: totalRevenue,
          platformFee,
          netAmount: netRevenue,
          bookingsCount: bookings.length,
          data: reportData as any,
        },
      })

      return NextResponse.json({ ...reportData, reportNumber })
    }

    return NextResponse.json(reportData)
  } catch (error: any) {
    console.error("API Report Error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "فشل الاتصال بقاعدة البيانات" },
      { status: 500 }
    )
  }
}