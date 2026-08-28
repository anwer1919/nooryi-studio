import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  Calendar, 
  Music, 
  Users, 
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  ArrowUpRight,
  UserCog
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login")
  }

  const userRole = session.user.role || "USER"
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  const isArtistManager = userRole === "ARTIST_MANAGER"

  if (!isAdmin && !isArtistManager) {
    redirect("/")
  }

  // جلب البيانات حسب الدور
  let managerArtistId: string | null = null
  if (isArtistManager) {
    const managerUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { artistId: true },
    })
    managerArtistId = managerUser?.artistId || null
  }

  const where = isArtistManager && managerArtistId ? { artistId: managerArtistId } : {}

  const [
    totalBookings,
    pendingBookings,
    approvedBookings,
    completedBookings,
    totalRevenue,
    recentBookings,
    totalArtists,
    totalManagers,
  ] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.count({ where: { ...where, status: "PENDING_APPROVAL" } }),
    prisma.booking.count({ where: { ...where, status: "APPROVED" } }),
    prisma.booking.count({ where: { ...where, status: "COMPLETED" } }),
    prisma.booking.aggregate({
      where,
      _sum: { grossAmount: true },
    }),
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        artist: { select: { name: true, profileImage: true } },
      },
    }),
    isAdmin ? prisma.artist.count() : Promise.resolve(0),
    isAdmin ? prisma.user.count({ where: { role: "ARTIST_MANAGER" } }) : Promise.resolve(0),
  ])

  const revenue = totalRevenue._sum.grossAmount || 0

  return (
    <div suppressHydrationWarning>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-primary dark:text-white mb-2">
          {isAdmin ? "مرحباً بك في لوحة التحكم" : "لوحة مدير الأعمال"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {isAdmin 
            ? "نظرة عامة على أداء المنصة"
            : "إدارة حجوزات الفنان المُسند إليك"
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Bookings */}
        <div className="card-premium relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -translate-x-10 -translate-y-10 group-hover:bg-accent/20 transition-all duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-accent/20 flex items-center justify-center">
                <Calendar className="text-primary dark:text-accent" size={24} />
              </div>
              <ArrowUpRight className="text-gray-400" size={20} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">إجمالي الحجوزات</p>
            <p className="text-3xl font-black text-primary dark:text-white">{totalBookings}</p>
          </div>
        </div>

        {/* Pending */}
        <div className="card-premium relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -translate-x-10 -translate-y-10 group-hover:bg-orange-500/20 transition-all duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Clock className="text-orange-500" size={24} />
              </div>
              <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded-lg">
                {pendingBookings}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">قيد المراجعة</p>
            <p className="text-3xl font-black text-primary dark:text-white">{pendingBookings}</p>
          </div>
        </div>

        {/* Revenue */}
        <div className="card-premium relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -translate-x-10 -translate-y-10 group-hover:bg-accent/20 transition-all duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <DollarSign className="text-primary dark:text-accent" size={24} />
              </div>
              <ArrowUpRight className="text-accent" size={20} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">إجمالي الإيرادات</p>
            <p className="text-2xl font-black text-primary dark:text-white">{revenue.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">ج.م</p>
          </div>
        </div>

        {/* Completed */}
        <div className="card-premium relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -translate-x-10 -translate-y-10 group-hover:bg-green-500/20 transition-all duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="text-green-500" size={24} />
              </div>
              <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
                نشط
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">مكتملة</p>
            <p className="text-3xl font-black text-primary dark:text-white">{completedBookings}</p>
          </div>
        </div>
      </div>

      {/* Admin Only Stats */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/artists" className="card-premium group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">الفنانين</p>
                <p className="text-2xl font-black text-primary dark:text-white">{totalArtists}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Music className="text-primary dark:text-accent" size={28} />
              </div>
            </div>
          </Link>

          <Link href="/admin/artists-managers" className="card-premium group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">مديرو الأعمال</p>
                <p className="text-2xl font-black text-primary dark:text-white">{totalManagers}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserCog className="text-primary dark:text-accent" size={28} />
              </div>
            </div>
          </Link>

          <Link href="/admin/stats" className="card-premium group cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">التقارير المالية</p>
                <p className="text-lg font-bold text-primary dark:text-white">عرض التفاصيل</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="text-primary dark:text-accent" size={28} />
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="card-premium p-0 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary dark:text-white flex items-center gap-2">
            <Calendar size={20} className="text-accent" />
            أحدث الحجوزات
          </h2>
          <Link 
            href="/admin/bookings" 
            className="text-sm text-accent hover:text-primary dark:hover:text-accent-light font-semibold transition-colors"
          >
            عرض الكل ←
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={48} />
            <p className="text-gray-500 dark:text-gray-400">لا توجد حجوزات بعد</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-dark-border">
            {recentBookings.map((booking) => (
              <Link 
                key={booking.id}
                href={`/admin/bookings/${booking.id}`}
                className="flex items-center justify-between p-6 hover:bg-accent/5 dark:hover:bg-white/5 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  {booking.artist?.profileImage ? (
                    <img 
                      src={booking.artist.profileImage}
                      alt={booking.artist.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-accent/20 flex items-center justify-center">
                      <Music className="text-primary dark:text-accent" size={20} />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-primary dark:text-white">{booking.artist?.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{booking.clientName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-left">
                    <p className="font-bold text-primary dark:text-accent text-lg">
                      {(booking.grossAmount || 0).toLocaleString()} ج.م
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(booking.date).toISOString().split('T')[0]}
                    </p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    booking.status === "COMPLETED" ? "bg-green-500/10 text-green-600 dark:text-green-400" :
                    booking.status === "APPROVED" ? "bg-accent/20 text-primary-dark dark:bg-accent-dark/20 dark:text-accent" :
                    booking.status === "CANCELLED" ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                    "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                  }`}>
                    {booking.status === "COMPLETED" ? "مكتمل" :
                     booking.status === "APPROVED" ? "موافق عليه" :
                     booking.status === "CANCELLED" ? "ملغي" :
                     "قيد المراجعة"}
                  </span>
                  <ArrowUpRight className="text-gray-300 group-hover:text-accent transition-colors" size={20} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}