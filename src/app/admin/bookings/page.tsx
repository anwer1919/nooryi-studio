import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Calendar, Music, Clock, Eye, Filter } from "lucide-react"

export const dynamic = "force-dynamic"

function formatSafeDate(date: Date | string): string {
  try {
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  } catch {
    return "تاريخ غير صالح"
  }
}

export default async function AdminBookingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) redirect("/login")

  const userRole = session.user.role || "USER"
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  const isArtistManager = userRole === "ARTIST_MANAGER"

  if (!isAdmin && !isArtistManager) redirect("/")

  // جلب الفنان المرتبط بمدير الأعمال
  let managerArtistId: string | null = null
  let managedArtistName: string | null = null
  
  if (isArtistManager) {
    const managerUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { 
        artistId: true,
        managedArtist: { select: { name: true } }
      },
    })
    managerArtistId = managerUser?.artistId || null
    managedArtistName = managerUser?.managedArtist?.name || null
  }

  // جلب الحجوزات حسب الصلاحيات
  const where = isArtistManager && managerArtistId 
    ? { artistId: managerArtistId }
    : {}

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      artist: { select: { name: true, profileImage: true } },
      venue: { select: { name: true } },
    },
  })

  // إحصائيات
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "PENDING_APPROVAL").length,
    approved: bookings.filter(b => b.status === "APPROVED").length,
    completed: bookings.filter(b => b.status === "COMPLETED").length,
    revenue: bookings.reduce((sum, b) => sum + (b.grossAmount || 0), 0),
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL": return { title: "قيد المراجعة", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20" }
      case "APPROVED": return { title: "موافق عليه", color: "text-primary dark:text-accent", bg: "bg-accent/10 dark:bg-accent-dark/20 border-accent/30 dark:border-accent-dark/30" }
      case "COMPLETED": return { title: "مكتمل", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20" }
      case "CANCELLED": return { title: "ملغي", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20" }
      default: return { title: status, color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-dark-border" }
    }
  }

  const timeSlotMap: Record<string, string> = {
    "MORNING": "صباحاً", "AFTERNOON": "ظهيرة", "EVENING": "مساءً", "NIGHT": "ليلاً",
  }

  return (
    <div suppressHydrationWarning>
      {/* Header */}
      <div className="mb-8">
        {isArtistManager && managedArtistName && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 dark:bg-accent-dark/20 text-primary dark:text-accent text-sm font-semibold mb-4">
            <Music size={16} />
            <span>مدير أعمال: {managedArtistName}</span>
          </div>
        )}
        <h1 className="text-4xl font-black text-primary dark:text-white mb-2">
          {isAdmin ? "إدارة الحجوزات" : "حجوزات الفنان"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {isAdmin ? "جميع الحجوزات في المنصة" : `حجوزات ${managedArtistName || "الفنان"}`}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="card-premium">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">الإجمالي</p>
          <p className="text-2xl font-black text-primary dark:text-white">{stats.total}</p>
        </div>
        <div className="card-premium">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">قيد المراجعة</p>
          <p className="text-2xl font-black text-orange-600 dark:text-orange-400">{stats.pending}</p>
        </div>
        <div className="card-premium">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">موافق عليه</p>
          <p className="text-2xl font-black text-primary dark:text-accent">{stats.approved}</p>
        </div>
        <div className="card-premium">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">مكتمل</p>
          <p className="text-2xl font-black text-green-600 dark:text-green-400">{stats.completed}</p>
        </div>
        <div className="card-premium">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">الإيرادات</p>
          <p className="text-xl font-black text-primary dark:text-white">{stats.revenue.toLocaleString()} <span className="text-xs">ج.م</span></p>
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="card-premium text-center py-20">
          <Calendar className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={64} />
          <h3 className="text-2xl font-bold text-primary dark:text-white mb-2">لا توجد حجوزات</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {isArtistManager ? "لا توجد حجوزات للفنان المُسند إليك بعد" : "عندما يقوم العملاء بإنشاء حجوزات، ستظهر هنا"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const sc = getStatusConfig(booking.status)
            const deposit = booking.depositAmount || (booking.grossAmount || 0) * 0.2
            
            return (
              <div key={booking.id} className="card-premium hover:shadow-hover transition-all duration-300">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-[250px]">
                    {booking.artist?.profileImage ? (
                      <img 
                        src={booking.artist.profileImage} 
                        alt={booking.artist.name}
                        className="w-14 h-14 rounded-xl object-cover shadow-soft"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-accent/20 dark:bg-accent-dark/20 flex items-center justify-center">
                        <Music className="text-primary dark:text-accent" size={24} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-primary dark:text-white mb-0.5">{booking.artist?.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">العميل: {booking.clientName}</p>
                      <p className="text-xs text-gray-400 mt-1">#{booking.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <p className="flex items-center gap-2 text-sm mb-1 text-primary dark:text-white">
                      <Calendar size={14} className="text-accent" />
                      <span suppressHydrationWarning>{formatSafeDate(booking.date)}</span>
                    </p>
                    <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock size={14} />
                      {timeSlotMap[booking.timeSlot] || booking.timeSlot}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{booking.venue?.name || "مكان غير محدد"}</p>
                  </div>

                  <div className="flex-1 min-w-[150px]">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">المبلغ الإجمالي</p>
                    <p className="text-xl font-black text-primary dark:text-white">
                      {(booking.grossAmount || 0).toLocaleString()} ج.م
                    </p>
                    <p className="text-xs text-accent mt-1">
                      العربون: {deposit.toLocaleString()} ج.م
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${sc.bg} ${sc.color}`}>
                      {sc.title}
                    </span>
                    
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="btn-secondary text-xs py-2 px-4 flex items-center gap-2"
                    >
                      <Eye size={14} />
                      عرض التفاصيل
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}