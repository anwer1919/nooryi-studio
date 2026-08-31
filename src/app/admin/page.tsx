import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import {
  Calendar,
  Music,
  DollarSign,
  CheckCircle2,
  Clock,
  UserCog,
  BarChart3,
  Users
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

  let totalBookings = 0
  let pendingBookings = 0
  let completedBookings = 0
  let revenue = 0
  let recentBookings: any[] = []
  let totalArtists = 0
  let totalUsers = 0

  try {
    let managerArtistId: string | null = null
    if (isArtistManager) {
      const managerUser = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { artistId: true },
      })
      managerArtistId = managerUser?.artistId || null
    }

    const where = isArtistManager && managerArtistId ? { artistId: managerArtistId } : {}

    const [bookings, artists, users, allBookings] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { id: "desc" },
        take: 5,
        include: { artist: { select: { name: true, profileImage: true } } },
      }),
      isAdmin ? prisma.artist.count() : Promise.resolve(0),
      isAdmin ? prisma.user.count() : Promise.resolve(0),
      prisma.booking.findMany({ where, select: { status: true, grossAmount: true } })
    ])

    recentBookings = bookings
    totalArtists = artists
    totalUsers = users
    totalBookings = allBookings.length
    pendingBookings = allBookings.filter(b => b.status === "PENDING_APPROVAL").length
    completedBookings = allBookings.filter(b => b.status === "COMPLETED").length
    revenue = allBookings.reduce((sum, b) => sum + Number(b.grossAmount || 0), 0)

  } catch (error: any) {
    console.error("Error fetching admin data:", error.message)
  }

  const safeFormatDate = (date: any) => {
    if (!date) return "غير محدد"
    try {
      return new Date(date).toISOString().split('T')[0]
    } catch {
      return "غير محدد"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isAdmin ? "مرحباً بك في لوحة التحكم" : "لوحة مدير الأعمال"}
          </h1>
          <p className="text-gray-500">
            {isAdmin ? "نظرة عامة على أداء المنصة" : "إدارة حجوزات الفنان"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar size={20} className="text-purple-600" />
            </div>
            <p className="text-sm text-gray-500 mb-1">الحجوزات</p>
            <p className="text-3xl font-bold text-gray-900">{totalBookings}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <p className="text-sm text-gray-500 mb-1">قيد المراجعة</p>
            <p className="text-3xl font-bold text-gray-900">{pendingBookings}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <p className="text-sm text-gray-500 mb-1">الإيرادات</p>
            <p className="text-2xl font-bold text-gray-900">{revenue.toLocaleString()}</p>
            <p className="text-xs text-gray-400">ج.م</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle2 size={20} className="text-blue-600" />
            </div>
            <p className="text-sm text-gray-500 mb-1">مكتملة</p>
            <p className="text-3xl font-bold text-gray-900">{completedBookings}</p>
          </div>
        </div>

        {/* Admin Only Links */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link href="/admin/artists" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-purple-300 hover:shadow-md transition-all flex items-center justify-between group">
              <div>
                <p className="text-sm text-gray-500 mb-1">الفنانين</p>
                <p className="text-2xl font-bold text-gray-900">{totalArtists}</p>
              </div>
              <Music size={24} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
            </Link>

            <Link href="/admin/users" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-purple-300 hover:shadow-md transition-all flex items-center justify-between group">
              <div>
                <p className="text-sm text-gray-500 mb-1">المستخدمين</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
              <Users size={24} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
            </Link>

            <Link href="/admin/stats" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-purple-300 hover:shadow-md transition-all flex items-center justify-between group">
              <div>
                <p className="text-sm text-gray-500 mb-1">التقارير</p>
                <p className="text-lg font-semibold text-gray-900">عرض</p>
              </div>
              <BarChart3 size={24} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
            </Link>
          </div>
        )}

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">أحدث الحجوزات</h2>
            <Link href="/admin/bookings" className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors">عرض الكل ←</Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-500">لا توجد حجوزات بعد</p>
            </div>
          ) : (
            <div>
              {recentBookings.map((booking, index) => (
                <Link
                  key={booking.id}
                  href={`/admin/bookings/${booking.id}`}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 transition-colors hover:bg-gray-50 ${
                    index < recentBookings.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    {booking.artist?.profileImage ? (
                      <img
                        src={booking.artist.profileImage}
                        alt={booking.artist?.name || "فنان"}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Music size={20} className="text-purple-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{booking.artist?.name || "فنان"}</p>
                      <p className="text-xs text-gray-500">{booking.clientName || "عميل"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <div className="text-left">
                      <p className="font-bold text-gray-900 text-sm">{Number(booking.grossAmount || 0).toLocaleString()} ج.م</p>
                      <p className="text-xs text-gray-400" suppressHydrationWarning>{safeFormatDate(booking.date)}</p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      booking.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                      booking.status === "APPROVED" ? "bg-purple-100 text-purple-700" :
                      booking.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {booking.status === "COMPLETED" ? "مكتمل" :
                       booking.status === "APPROVED" ? "موافق" :
                       booking.status === "CANCELLED" ? "ملغي" :
                       "مراجعة"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}