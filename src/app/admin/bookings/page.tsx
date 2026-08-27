import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  Calendar, 
  ArrowRight, 
  Music,
  Filter,
  Search
} from "lucide-react"

export default async function AdminBookingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
    redirect("/login")
  }

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      artist: { select: { name: true, slug: true, profileImage: true, category: true } },
      customer: { select: { fullName: true, phone: true, email: true } },
      venue: { select: { name: true, address: true } },
    },
  })

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
        <div className="mb-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-4 transition-colors"
          >
            <ArrowRight size={16} className="rotate-180" />
            العودة للوحة التحكم
          </Link>
          <h1 className="text-4xl font-black mb-2">إدارة الحجوزات</h1>
          <p className="text-white/60">إجمالي {bookings.length} حجز</p>
        </div>

        {/* Filters */}
        <div className="glass rounded-2xl p-4 mb-6 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="البحث عن حجز..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-500/50"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition-colors border border-white/10">
            <Filter size={16} />
            فلترة
          </button>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="glass rounded-3xl p-16 text-center">
            <Calendar className="mx-auto mb-4 text-white/40" size={64} />
            <h3 className="text-xl font-bold mb-2">لا توجد حجوزات</h3>
            <p className="text-white/60">لم يتم إنشاء أي حجز حتى الآن</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div 
                key={booking.id}
                className="glass rounded-2xl p-6 hover:bg-white/[0.08] transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Artist + Customer Info */}
                  <div className="flex items-center gap-4 flex-1">
                    {booking.artist?.profileImage ? (
                      <img 
                        src={booking.artist.profileImage} 
                        alt={booking.artist.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                        <Music className="text-yellow-400" size={24} />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1">{booking.artist?.name || "فنان غير معروف"}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/60">
                        <span>العميل: {booking.customer?.fullName || "غير محدد"}</span>
                        <span>•</span>
                        <span>الهاتف: {booking.customer?.phone || "-"}</span>
                        <span>•</span>
                        <span>{booking.artist?.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Date + Status */}
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {new Date(booking.date).toLocaleDateString("ar-EG", { 
                          weekday: "long", 
                          year: "numeric", 
                          month: "long", 
                          day: "numeric" 
                        })}
                      </p>
                      <p className="text-xs text-white/60">{booking.timeSlot}</p>
                    </div>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-white/40 text-xs mb-1">المكان</p>
                    <p className="font-semibold">{booking.venue?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">العنوان</p>
                    <p className="font-semibold">{booking.venue?.address || "-"}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">تاريخ الحجز</p>
                    <p className="font-semibold">
                      {new Date(booking.createdAt).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">الإجراء</p>
                    <Link 
                      href={`/admin/bookings/${booking.id}`}
                      className="text-yellow-400 hover:text-yellow-300 font-semibold text-sm"
                    >
                      عرض التفاصيل ←
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}