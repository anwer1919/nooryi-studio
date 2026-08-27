import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  Users, 
  Music, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  Wallet,
  CreditCard
} from "lucide-react"

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
    redirect("/login")
  }

  // جلب جميع البيانات
  const [
    totalArtists, 
    totalBookings, 
    pendingBookings, 
    approvedBookings, 
    totalUsers,
    allBookings,
  ] = await Promise.all([
    prisma.artist.count(),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.booking.count({ where: { status: "APPROVED" } }),
    prisma.user.count(),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        artist: { select: { name: true, slug: true, profileImage: true } },
        customer: true,
      },
    }),
  ])

  // حساب الإحصائيات المالية
  const allBookingsForStats = await prisma.booking.findMany()
  const totalRevenue = allBookingsForStats.reduce((sum, b) => sum + (b.grossAmount || 0), 0)
  const totalDeposits = allBookingsForStats.reduce((sum, b) => sum + (b.depositAmount || 0), 0)
  const totalRemaining = allBookingsForStats.reduce((sum, b) => sum + (b.remainingAmount || 0), 0)

  const stats = [
    { 
      label: "إجمالي الإيرادات", 
      value: `${totalRevenue.toLocaleString()} ج.م`, 
      icon: DollarSign, 
      color: "green",
      change: "+12%",
      link: "/admin/bookings"
    },
    { 
      label: "إجمالي الحجوزات", 
      value: totalBookings, 
      icon: Calendar, 
      color: "blue",
      change: "+8%",
      link: "/admin/bookings"
    },
    { 
      label: "حجوزات قيد المراجعة", 
      value: pendingBookings, 
      icon: Clock, 
      color: "orange",
      change: "جديد",
      link: "/admin/bookings"
    },
    { 
      label: "إجمالي الفنانين", 
      value: totalArtists, 
      icon: Music, 
      color: "yellow",
      change: "+15%",
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
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-black">لوحة التحكم</h1>
            <Link 
              href="/" 
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              العودة للرئيسية ←
            </Link>
          </div>
          <p className="text-white/60">مرحباً بك في لوحة إدارة Nooryi Studio</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <Link 
              key={i} 
              href={stat.link}
              className="group glass rounded-3xl p-6 hover:bg-white/[0.08] transition-all duration-500 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`text-${stat.color}-400`} size={24} />
                </div>
                <div className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                  <TrendingUp size={12} />
                  <span>{stat.change}</span>
                </div>
              </div>
              <p className="text-3xl font-black mb-1">{stat.value}</p>
              <p className="text-sm text-white/60">{stat.label}</p>
            </Link>
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

          {allBookings.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              <Calendar className="mx-auto mb-4" size={48} />
              <p>لا توجد حجوزات حتى الآن</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allBookings.map((booking) => (
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
                      <p className="font-semibold">{booking.artist?.name || "فنان غير معروف"}</p>
                      <p className="text-sm text-white/60">
                        {booking.clientName || booking.customer?.fullName} • {booking.timeSlot}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-bold text-green-400">
                        {(booking.grossAmount || 0).toLocaleString()} ج.م
                      </p>
                      <p className="text-xs text-white/50">
                        عربون: {(booking.depositAmount || 0).toLocaleString()} ج.م
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