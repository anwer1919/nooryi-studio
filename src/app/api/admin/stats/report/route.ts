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

    // بناء شروط البحث
    const whereClause: any = {}

    // فلترة حسب مدير الأعمال
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
        // تجاهل
      }
    }

    // فلترة حسب التاريخ
    if (dateFrom || dateTo) {
      whereClause.date = {}
      if (dateFrom) whereClause.date.gte = new Date(dateFrom + "T00:00:00")
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

    // جلب جميع الحجوزات المطابقة
    const allBookings = await prisma.booking.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
      include: {
        artist: { select: { id: true, name: true, category: true } },
        venue: { select: { name: true } },
        customer: { select: { fullName: true } },
      },
    })

    // فلترة حسب حالة الدفع (بعد الجلب لأنها تعتمد على حسابات)
    let filteredBookings = allBookings
    if (paymentFilter && paymentFilter !== "ALL") {
      filteredBookings = allBookings.filter((b) => {
        const remaining = Number(b.remainingAmount || 0)
        const deposit = Number(b.depositAmount || 0)
        if (paymentFilter === "PAID") return remaining === 0 && deposit > 0
        if (paymentFilter === "PARTIAL") return deposit > 0 && remaining > 0
        if (paymentFilter === "UNPAID") return deposit === 0
        return true
      })
    }

    // إضافة clientName
    const bookingsWithNames = filteredBookings.map((b) => ({
      id: b.id,
      date: b.date,
      status: b.status,
      timeSlot: b.timeSlot,
      clientName: b.customer?.fullName || b.clientName || "عميل",
      artistName: b.artist?.name || "غير محدد",
      artistCategory: b.artist?.category || "",
      venueName: b.venue?.name || "",
      grossAmount: Number(b.grossAmount || 0),
      depositAmount: Number(b.depositAmount || 0),
      remainingAmount: Number(b.remainingAmount || 0),
    }))

    // ====== حساب الإجماليات بدقة ======
    const totalRevenue = bookingsWithNames.reduce((sum, b) => sum + b.grossAmount, 0)
    const totalDeposits = bookingsWithNames.reduce((sum, b) => sum + b.depositAmount, 0)
    const totalRemaining = bookingsWithNames.reduce((sum, b) => sum + b.remainingAmount, 0)
    const platformFee = Math.round(totalRevenue * 0.05)
    const netRevenue = totalRevenue - platformFee
    const totalBookings = bookingsWithNames.length

    // إحصائيات حسب الحالة
    const byStatus = {
      completed: bookingsWithNames.filter((b) => b.status === "COMPLETED").length,
      approved: bookingsWithNames.filter((b) => b.status === "APPROVED").length,
      pending: bookingsWithNames.filter((b) => b.status === "PENDING_APPROVAL").length,
      cancelled: bookingsWithNames.filter((b) => b.status === "CANCELLED").length,
    }

    // إحصائيات حسب الدفع
    const byPayment = {
      paid: bookingsWithNames.filter((b) => b.remainingAmount === 0 && b.depositAmount > 0).length,
      partial: bookingsWithNames.filter((b) => b.depositAmount > 0 && b.remainingAmount > 0).length,
      unpaid: bookingsWithNames.filter((b) => b.depositAmount === 0).length,
    }

    // إحصائيات حسب الفنان
    const byArtist: any = {}
    bookingsWithNames.forEach((b) => {
      const artistName = b.artistName
      if (!byArtist[artistName]) byArtist[artistName] = { count: 0, revenue: 0 }
      byArtist[artistName].count++
      byArtist[artistName].revenue += b.grossAmount
    })

    const managerName = isManager ? session.user.name || "المدير" : "الإدارة العامة"

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
      totalBookings,
      byStatus,
      byPayment,
      byArtist,
    }

    // ====== حفظ التقرير ======
    let reportNumber = ""
    if (saveReport && totalBookings > 0) {
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
            platformFee: platformFee,
            netAmount: netRevenue,
            bookingsCount: totalBookings,
            data: {
              stats,
              bookings: bookingsWithNames,
            } as any,
          },
        })
      } catch (e: any) {
        console.error("Error saving report:", e.message)
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