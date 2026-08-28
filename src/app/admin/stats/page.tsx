import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Music,
  Users,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function StatsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
    redirect("/login")
  }

  // جلب جميع البيانات
  const [
    totalBookings,
    totalArtists,
    totalCustomers,
    completedBookings,
    pendingBookings,
    cancelledBookings,
    allBookings,
    allPayments,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.artist.count(),
    prisma.customer.count(),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
    prisma.booking.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.booking.count({ where: { status: "CANCELLED" } }),
    prisma.booking.findMany({
      include: { artist: { select: { name: true } } },
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ])

  // حساب الإحصائيات المالية
  const totalRevenue = allBookings.reduce((sum, b) => sum + (b.grossAmount || 0), 0)
  const totalDeposits = allBookings.reduce((sum, b) => sum + (b.depositAmount || 0), 0)
  const totalRemaining = allBookings.reduce((sum, b) => sum + (b.remainingAmount || 0), 0)
  const totalPayments = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0)

  // إحصائيات حسب الفنان
  const artistsStats = await prisma.artist.findMany({
    include: {
      bookings: {
        select: { grossAmount: true, status: true },
      },
    },
  })

  const artistsPerformance = artistsStats.map((artist) => {
    const artistRevenue = artist.bookings.reduce((sum, b) => sum + (b.grossAmount || 0), 0)
    const completedCount = artist.bookings.filter(b => b.status === "COMPLETED").length
    const commission = artistRevenue * (artist.commissionRate / 100)
    
    return {
      id: artist.id,
      name: artist.name,
      bookingsCount: artist.bookings.length,
      revenue: artistRevenue,
      completed: completedCount,
      commissionRate: artist.commissionRate,
      commission,
      artistEarnings: artistRevenue - commission,
    }
  }).sort((a, b) => b.revenue - a.revenue)

  // إحصائيات الشهر الحالي
  const currentMonth = new Date()
  currentMonth.setDate(1)
  currentMonth.setHours(0, 0, 0, 0)

  const monthBookings = allBookings.filter(b => new Date(b.createdAt) >= currentMonth)
  const monthRevenue = monthBookings.reduce((sum, b) => sum + (b.grossAmount || 0), 0)

  // آخر 10 حجوزات
  const recentBookings = allBookings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2">التقارير المالية</h1>
        <p className="text-white/60">نظرة شاملة على أداء المنصة والإيرادات</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <DollarSign className="text-green-400" size={20} />
            </div>
            <TrendingUp className="text-green-400" size={16} />
          </div>
          <p className="text-xs text-white/60 mb-1">إجمالي الإيرادات</p>
          <p className="text-2xl font-black text-green-400">{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-white/40 mt-1">ج.م</p>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <Calendar className="text-yellow-400" size={20} />
            </div>
            <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded">هذا الشهر</span>
          </div>
          <p className="text-xs text-white/60 mb-1">إيرادات الشهر</p>
          <p className="text-2xl font-black text-yellow-400">{monthRevenue.toLocaleString()}</p>
          <p className="text-xs text-white/40 mt-1">ج.م</p>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <CheckCircle2 className="text-blue-400" size={20} />
            </div>
          </div>
          <p className="text-xs text-white/60 mb-1">المبالغ المحصلة</p>
          <p className="text-2xl font-black text-blue-400">{totalDeposits.toLocaleString()}</p>
          <p className="text-xs text-white/40 mt-1">ج.م</p>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Clock className="text-orange-400" size={20} />
            </div>
          </div>
          <p className="text-xs text-white/60 mb-1">المبالغ المتبقية</p>
          <p className="text-2xl font-black text-orange-400">{totalRemaining.toLocaleString()}</p>
          <p className="text-xs text-white/40 mt-1">ج.م</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-white/60 mb-1">إجمالي الحجوزات</p>
          <p className="text-xl font-black">{totalBookings}</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-white/60 mb-1">مكتملة</p>
          <p className="text-xl font-black text-green-400">{completedBookings}</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-white/60 mb-1">قيد المراجعة</p>
          <p className="text-xl font-black text-orange-400">{pendingBookings}</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-white/60 mb-1">ملغاة</p>
          <p className="text-xl font-black text-red-400">{cancelledBookings}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Artists Performance */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Music size={20} className="text-yellow-400" />
              أداء الفنانين
            </h2>
            <span className="text-xs text-white/40">{artistsPerformance.length} فنان</span>
          </div>
          
          <div className="space-y-3">
            {artistsPerformance.slice(0, 5).map((artist, index) => (
              <div 
                key={artist.id}
                className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl hover:bg-white/[0.05] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{artist.name}</p>
                    <p className="text-xs text-white/40">
                      {artist.bookingsCount} حجز • {artist.completed} مكتمل
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm text-green-400">
                    {artist.revenue.toLocaleString()} ج.م
                  </p>
                  <p className="text-xs text-white/40">
                    عمولة {artist.commissionRate}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar size={20} className="text-yellow-400" />
              آخر الحجوزات
            </h2>
          </div>
          
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <div 
                key={booking.id}
                className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl"
              >
                <div>
                  <p className="font-semibold text-sm">{booking.artist?.name}</p>
                  <p className="text-xs text-white/40">
                    {booking.clientName} • #{booking.id.slice(0, 6)}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm">
                    {(booking.grossAmount || 0).toLocaleString()} ج.م
                  </p>
                  <p className={`text-xs ${
                    booking.status === "COMPLETED" ? "text-green-400" :
                    booking.status === "APPROVED" ? "text-blue-400" :
                    booking.status === "CANCELLED" ? "text-red-400" :
                    "text-orange-400"
                  }`}>
                    {booking.status === "COMPLETED" ? "مكتمل" :
                     booking.status === "APPROVED" ? "موافق عليه" :
                     booking.status === "CANCELLED" ? "ملغي" :
                     "قيد المراجعة"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payments History */}
      <div className="glass rounded-2xl p-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <DollarSign size={20} className="text-yellow-400" />
            سجل المدفوعات
          </h2>
          <span className="text-xs text-white/40">{allPayments.length} دفعة</span>
        </div>

        {allPayments.length === 0 ? (
          <p className="text-center text-white/40 py-8">لا توجد مدفوعات بعد</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-right text-xs text-white/40 font-semibold pb-3">التاريخ</th>
                  <th className="text-right text-xs text-white/40 font-semibold pb-3">المبلغ</th>
                  <th className="text-right text-xs text-white/40 font-semibold pb-3">الطريقة</th>
                  <th className="text-right text-xs text-white/40 font-semibold pb-3">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {allPayments.slice(0, 10).map((payment) => (
                  <tr key={payment.id} className="border-b border-white/5">
                    <td className="py-3 text-sm">
                      {new Date(payment.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="py-3 text-sm font-bold text-green-400">
                      {payment.amount.toLocaleString()} ج.م
                    </td>
                    <td className="py-3 text-sm text-white/60">
                      {payment.method}
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        payment.status === "COMPLETED" 
                          ? "bg-green-500/10 text-green-400" 
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}>
                        {payment.status === "COMPLETED" ? "مكتمل" : "قيد المعالجة"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}