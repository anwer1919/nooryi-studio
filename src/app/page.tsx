import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  Music, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight,
  Clock,
  CheckCircle2,
  DollarSign,
  Wallet,
  CreditCard,
  Users
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
    redirect("/login")
  }

  // جلب الإحصائيات
  const [
    totalArtists, 
    totalBookings, 
    pendingBookings, 
    approvedBookings, 
    totalUsers,
  ] = await Promise.all([
    prisma.artist.count(),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.booking.count({ where: { status: "APPROVED" } }),
    prisma.user.count({ where: { role: "USER" } }),
  ])

  // حساب الإحصائيات المالية
  const allBookings = await prisma.booking.findMany()
  const totalRevenue = allBookings.reduce((sum, b) => sum + (b.grossAmount || 0), 0)
  const totalDeposits = allBookings.reduce((sum, b) => sum + (b.depositAmount || 0), 0)
  const totalRemaining = allBookings.reduce((sum, b) => sum + (b.remainingAmount || 0), 0)

  // أحدث الحجوزات
  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      artist: { select: { name: true, slug: true, profileImage: true } },
      customer: true,
    },
  })

  const stats = [
    { 
      label: "إجمالي الإيرادات", 
      value: `${totalRevenue.toLocaleString()} ج.م`, 
      icon: DollarSign, 
      color: "green",
      link: "/admin/bookings"
    },
    { 
      label: "إجمالي الحجوزات", 
      value: totalBookings, 
      icon: Calendar, 
      color: "blue",
      link: "/admin/bookings"
    },
    { 
      label: "قيد المراجعة", 
      value: pendingBookings, 
      icon: Clock, 
      color: "orange",
      link: "/admin/bookings"
    },
    { 
      label: "إجمالي الفنانين", 
      value: totalArtists, 
      icon: Music, 
      color: "yellow",
      link: "/admin/artists"
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL": return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "APPROVED": return "bg-green-500/10 text-green-400 border-green-500/20"
      case "COMPLETED": return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "CANCELLED": return "bg-red-500/10 text-red-400 border-red-500/20"
      default: return "bg-white/5 text-white/60 border-white/10"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL": return "قيد المراجعة"
      case "APPROVED": return "موافق عليه"
      case "COMPLETED": return "مكتمل"
      case "CANCELLED": return "ملغي"
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-2">لوحة التحكم</h1>
          <p className="text-white/60">مرحباً بك في لوحة إدارة Nooryi Studio</p>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link href="/admin/bookings" className="glass rounded-2xl p-5 hover:bg-white/[0.08] transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Calendar className="text-blue-400" size={24} />
              </div>
              <div>
                <p className="font-bold">إدارة الحجوزات</p>
                <p className="text-xs text-white/60">{totalBookings} حجز</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/artists" className="glass rounded-2xl p-5 hover:bg-white/[0.08] transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <Music className="text-yellow-400" size={24} />
              </div>
              <div>
                <p className="font-bold">إدارة الفنانين</p>
                <p className="text-xs text-white/60">{totalArtists} فنان</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/admins" className="glass rounded-2xl p-5 hover:bg-white/[0.08] transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Users className="text-purple-400" size={24} />
              </div>
              <div>
                <p className="font-bold">إدارة المستخدمين</p>
                <p className="text-xs text-white/60">المستخدمون والأدمنز</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/stats" className="glass rounded-2xl p-5 hover:bg-white/[0.08] transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <TrendingUp className="text-green-400" size={24} />
              </div>
              <div>
                <p className="font-bold">التقارير</p>
                <p className="text-xs text-white/60">الإحصائيات التفصيلية</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="glass rounded-3xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center`}>
                  <stat.icon className={`text-${stat.color}-400`} size={24} />
                </div>
              </div>
              <p className="text-3xl font-black mb-1">{stat.value}</p>
              <p className="text-sm text-white/60">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <DollarSign className="text-green-400" size={20} />
              </div>
              <div>
                <p className="text-xs text-white/60">إجمالي الإيرادات</p>
                <p className="text-2xl font-black text-green-400">{totalRevenue.toLocaleString()} ج.م</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <Wallet className="text-yellow-400" size={20} />
              </div>
              <div>
                <p className="text-xs text-white/60">إجمالي العربون</p>
                <p className="text-2xl font-black text-yellow-400">{totalDeposits.toLocaleString()} ج.م</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <CreditCard className="text-red-400" size={20} />
              </div>
              <div>
                <p className="text-xs text-white/60">المبالغ المتبقية</p>
                <p className="text-2xl font-black text-red-400">{totalRemaining.toLocaleString()} ج.م</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="glass rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">أحدث الحجوزات</h2>
            <Link 
              href="/admin/bookings" 
              className="flex items-center gap-1 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              عرض الكل
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              <Calendar className="mx-auto mb-4" size={48} />
              <p>لا توجد حجوزات حتى الآن</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div 
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl transition-colors border border-white/5"
                >
                  <div className="flex items-center gap-4">
                    {booking.artist?.profileImage ? (
                      <img 
                        src={booking.artist.profileImage} 
                        alt={booking.artist.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                        <Music className="text-yellow-400" size={20} />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{booking.artist?.name || "فنان"}</p>
                      <p className="text-sm text-white/60">
                        {booking.clientName || "عميل"} • {booking.timeSlot}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-bold text-green-400">
                        {(booking.grossAmount || 0).toLocaleString()} ج.م
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}