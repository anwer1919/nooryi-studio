import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get("from")
    const dateTo = searchParams.get("to")
    const statusFilter = searchParams.get("status")
    const paymentFilter = searchParams.get("payment")
    const artistFilter = searchParams.get("artist")
    const saveReport = searchParams.get("save") === "true"

    const userRole = session.user.role || "USER"
    const isManager = userRole === "ARTIST_MANAGER"

    const whereClause: any = {}

    // فلترة حسب مدير الفنان
    if (isManager) {
      try {
        const managerUser = await prisma.user.findUnique({
          where: { email: session.user.email! },
          select: { artistId: true },
        })
        if (managerUser?.artistId) {
          whereClause.artistId = managerUser.artistId
        }
      } catch (e) {
        // تجاهل إذا لم يكن هناك حقل artistId
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

    // جلب الحجوزات
    let bookings = await prisma.booking.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
      include: {
        artist: { select: { id: true, name: true, category: true } },
        venue: { select: { name: true } },
        customer: { select: { fullName: true } },
      },
    })

    // فلترة حسب حالة الدفع
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

    // إضافة clientName من customer أو الحقل المباشر
    const bookingsWithNames = bookings.map((b) => ({
      ...b,
      clientName: b.customer?.fullName || b.clientName || "عميل",
    }))

    // حساب الإجماليات
    const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.grossAmount || 0), 0)
    const totalDeposits = bookings.reduce((sum, b) => sum + Number(b.depositAmount || 0), 0)
    const totalRemaining = bookings.reduce((sum, b) => sum + Number(b.remainingAmount || 0), 0)
    const platformFee = Math.round(totalRevenue * 0.05)
    const netRevenue = totalRevenue - platformFee

    // إحصائيات حسب الحالة
    const byStatus = {
      completed: bookings.filter((b) => b.status === "COMPLETED").length,
      approved: bookings.filter((b) => b.status === "APPROVED").length,
      pending: bookings.filter((b) => b.status === "PENDING_APPROVAL").length,
      cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
    }

    // إحصائيات حسب الدفع
    const byPayment = {
      paid: bookings.filter((b) => Number(b.remainingAmount || 0) === 0 && Number(b.depositAmount || 0) > 0).length,
      partial: bookings.filter((b) => Number(b.depositAmount || 0) > 0 && Number(b.remainingAmount || 0) > 0).length,
      unpaid: bookings.filter((b) => Number(b.depositAmount || 0) === 0).length,
    }

    // إحصائيات حسب الفنان
    const byArtist: any = {}
    bookings.forEach((b) => {
      const artistName = b.artist?.name || "غير محدد"
      if (!byArtist[artistName]) byArtist[artistName] = { count: 0, revenue: 0 }
      byArtist[artistName].count++
      byArtist[artistName].revenue += Number(b.grossAmount || 0)
    })

    const managerName = isManager
      ? session.user.name || "المدير"
      : "الإدارة العامة"

    // قائمة الفنانين للفلتر
    let artists: any[] = []
    try {
      artists = await prisma.artist.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    } catch (e) {
      // تجاهل
    }

    const stats = {
      totalRevenue,
      totalDeposits,
      totalRemaining,
      platformFee,
      netRevenue,
      totalBookings: bookings.length,
      byStatus,
      byPayment,
      byArtist,
    }

    // حفظ التقرير إذا طُلب
    let reportNumber = ""
    if (saveReport) {
      try {
        reportNumber = `RPT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`
        await prisma.generatedReport.create({
          data: {
            reportNumber,
            type: "REPORT",
            title: "تقرير مالي شامل",
            generatedFor: managerName,
            dateFrom: dateFrom ? new Date(dateFrom) : null,
            dateTo: dateTo ? new Date(dateTo) : null,
            totalAmount: totalRevenue,
            platformFee,
            netAmount: netRevenue,
            bookingsCount: bookings.length,
            data: { stats, bookings: bookingsWithNames } as any,
          },
        })
      } catch (e) {
        console.error("Error saving report:", e)
        // التقرير يعمل حتى لو فشل الحفظ
      }
    }

    return NextResponse.json({
      success: true,
      data: bookingsWithNames,
      stats,
      managerName,
      artists,
      reportNumber,
    })
  } catch (error: any) {
    console.error("API Report Error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "فشل الاتصال" },
      { status: 500 }
    )
  }
}