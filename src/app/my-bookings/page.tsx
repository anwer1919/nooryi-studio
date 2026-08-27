import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  Calendar, 
  Music,
  Clock,
  Eye,
  ArrowRight
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function MyBookingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/my-bookings")
  }

  const bookings = await prisma.booking.findMany({
    where: {
      clientEmail: session.user.email,
    },
    orderBy: { createdAt: "desc" },
    include: {
      artist: {
        select: { name: true, profileImage: true, slug: true },
      },
      venue: {
        select: { name: true },
      },
    },
  }).catch(() => [])

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return { title: "قيد المراجعة", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" }
      case "APPROVED":
        return { title: "موافق عليه", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" }
      case "COMPLETED":
        return { title: "مكتمل", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" }
      case "CANCELLED":
        return { title: "ملغي", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" }
      default:
        return { title: status, color: "text-white", bg: "bg-white/5 border-white/10" }
    }
  }

  const timeSlotMap: Record<string, string> = {
    "MORNING": "صباحاً",
    "AFTERNOON": "ظهيرة",
    "EVENING": "مساءً",
    "NIGHT": "ليلاً",
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-4"
          >
            <ArrowRight size={16} className="rotate-180" />
            العودة للرئيسية
          </Link>
          <h1 className="text-4xl font-black mb-2">حجوزاتي</h1>
          <p className="text-white/60">إجمالي الحجوزات: {bookings.length}</p>
        </div>

        {bookings.length === 0 ? (
          <div className="glass rounded-3xl p-16 text-center">
            <Calendar className="mx-auto mb-4 text-white/40" size={64} />
            <h3 className="text-2xl font-bold mb-2">لا توجد حجوزات بعد</h3>
            <p className="text-white/60 mb-6">لم تقم بأي حجز حتى الآن</p>
            <Link 
              href="/artists"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all"
            >
              <Music size={18} />
              تصفح الفنانين واحجز الآن
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
                  className="glass rounded-3xl p-6 hover:bg-white/[0.03] transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-[250px]">
                      {booking.artist?.profileImage ? (
                        <img 
                          src={booking.artist.profileImage} 
                          alt={booking.artist.name}
                          className="w-14 h-14 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
                          <Music className="text-yellow-400" size={24} />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-lg mb-0.5">{booking.artist?.name || "فنان"}</h3>
                        <p className="text-sm text-white/60">
                          {booking.venue?.name || "مكان غير محدد"}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 min-w-[200px]">
                      <p className="flex items-center gap-2 text-sm mb-1">
                        <Calendar size={14} className="text-yellow-400" />
                        {new Date(booking.date).toLocaleDateString("ar-EG")}
                      </p>
                      <p className="flex items-center gap-2 text-sm text-white/60">
                        <Clock size={14} />
                        {timeSlotMap[booking.timeSlot] || booking.timeSlot}
                      </p>
                    </div>

                    <div className="flex-1 min-w-[150px]">
                      <p className="text-xs text-white/40 mb-1">المبلغ الإجمالي</p>
                      <p className="text-xl font-black text-yellow-400">
                        {(booking.grossAmount || 0).toLocaleString()} ج.م
                      </p>
                      <p className="text-xs text-green-400 mt-1">
                        العربون: {deposit.toLocaleString()} ج.م
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${sc.bg} ${sc.color}`}>
                        {sc.title}
                      </span>
                      
                      <Link
                        href={`/booking/${booking.id}`}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-semibold hover:bg-yellow-500/20 transition-all"
                      >
                        <Eye size={16} />
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