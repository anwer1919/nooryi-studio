import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Calendar, Music, Clock, Eye, Plus } from "lucide-react"

export const dynamic = "force-dynamic"

function formatSafeDate(date: Date | string): string {
  try {
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  } catch {
    return "تاريخ غير صالح"
  }
}

export default async function MyBookingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/my-bookings")
  }

  const bookings = await prisma.booking.findMany({
    where: { clientEmail: session.user.email },
    orderBy: { createdAt: "desc" },
    include: {
      artist: { select: { name: true, profileImage: true, slug: true } },
      venue: { select: { name: true } },
    },
  }).catch(() => [])

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
    <div className="min-h-screen bg-background dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-primary dark:text-white mb-2">حجوزاتي</h1>
          <p className="text-gray-500 dark:text-gray-400">إجمالي الحجوزات: {bookings.length}</p>
        </div>

        {bookings.length === 0 ? (
          <div className="card-premium text-center py-20">
            <Calendar className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={64} />
            <h3 className="text-2xl font-bold text-primary dark:text-white mb-2">لا توجد حجوزات بعد</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">لم تقم بأي حجز حتى الآن</p>
            <Link 
              href="/artists"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus size={18} />
              احجز فنانك الأول
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const sc = getStatusConfig(booking.status)
              const deposit = booking.depositAmount || (booking.grossAmount || 0) * 0.2
              
              return (
                <div 
                  key={booking.id}
                  className="card-premium hover:shadow-hover transition-all duration-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-[250px]">
                      {booking.artist?.profileImage ? (
                        <img 
                          src={booking.artist.profileImage} 
                          alt={booking.artist.name}
                          className="w-16 h-16 rounded-xl object-cover shadow-soft"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-accent/20 dark:bg-accent-dark/20 flex items-center justify-center">
                          <Music className="text-primary dark:text-accent" size={28} />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-lg text-primary dark:text-white mb-0.5">{booking.artist?.name || "فنان"}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{booking.venue?.name || "مكان غير محدد"}</p>
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
                        href={`/booking/${booking.id}`}
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
    </div>
  )
}