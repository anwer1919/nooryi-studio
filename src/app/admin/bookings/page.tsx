import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Calendar, Music, Clock, Eye, ArrowRight } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminBookingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/login")
  }

  const userRole = session.user.role
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  const isArtistManager = userRole === "ARTIST_MANAGER"

  if (!isAdmin && !isArtistManager) {
    redirect("/")
  }

  // جلب الفنان المرتبط بمدير الأعمال
  let managerArtistId: string | null = null
  if (isArtistManager) {
    const managerUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { artistId: true },
    })
    managerArtistId = managerUser?.artistId || null
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
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2">
          {isAdmin ? "إدارة الحجوزات" : "حجوزاتي"}
        </h1>
        <p className="text-white/60">
          {isAdmin 
            ? `إجمالي الحجوزات: ${bookings.length}`
            : `حجوزات الفنان: ${bookings.length}`
          }
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="glass rounded-3xl p-16 text-center">
          <Calendar className="mx-auto mb-4 text-white/40" size={64} />
          <h3 className="text-2xl font-bold mb-2">لا توجد حجوزات</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const sc = getStatusConfig(booking.status)
            const deposit = booking.depositAmount || (booking.grossAmount || 0) * 0.2
            
            return (
              <div 
                key={booking.id}
                className="glass rounded-2xl p-6 hover:bg-white/[0.03] transition-all"
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
                      <h3 className="font-bold text-lg mb-0.5">{booking.artist?.name}</h3>
                      <p className="text-sm text-white/60">العميل: {booking.clientName}</p>
                    </div>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <p className="flex items-center gap-2 text-sm mb-1">
                      <Calendar size={14} className="text-yellow-400" />
                      {new Date(booking.date).toLocaleDateString("en-GB")}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-white/60">
                      <Clock size={14} />
                      {timeSlotMap[booking.timeSlot] || booking.timeSlot}
                    </p>
                  </div>

                  <div className="flex-1 min-w-[150px]">
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
                      href={`/admin/bookings/${booking.id}`}
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
  )
}