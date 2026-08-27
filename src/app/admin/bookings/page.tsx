import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  Calendar, 
  ArrowRight, 
  Music,
  Filter,
  Search,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Wallet,
  CreditCard
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
      customer: true,
      venue: true,
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

  // حساب الإحصائيات المالية
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.grossAmount || 0), 0)
  const totalDeposits = bookings.reduce((sum, b) => sum + (b.depositAmount || 0), 0)
  const totalRemaining = bookings.reduce((sum, b) => sum + (b.remainingAmount || 0), 0)

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

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <DollarSign className="text-green-400" size={20} />
              </div>
              <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">إجمالي</span>
            </div>
            <p className="text-2xl font-black">{totalRevenue.toLocaleString()} ج.م</p>
            <p className="text-sm text-white/60">إجمالي الإيرادات</p>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <Wallet className="text-yellow-400" size={20} />
              </div>
              <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full">محصّل</span>
            </div>
            <p className="text-2xl font-black">{totalDeposits.toLocaleString()} ج.م</p>
            <p className="text-sm text-white/60">إجمالي العربون</p>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <CreditCard className="text-red-400" size={20} />
              </div>
              <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-full">متبقي</span>
            </div>
            <p className="text-2xl font-black">{totalRemaining.toLocaleString()} ج.م</p>
            <p className="text-sm text-white/60">المبالغ المتبقية</p>
          </div>
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
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Artist + Customer Info */}
                  <div className="flex items-start gap-4 flex-1">
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
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold mb-1">{booking.artist?.name || "فنان غير معروف"}</h3>
                          <p className="text-xs text-white/50">{booking.artist?.category}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/60">
                        <span>العميل: {booking.clientName || booking.customer?.fullName || "غير محدد"}</span>
                        <span className="flex items-center gap-1">
                          <Phone size={12} />
                          {booking.clientPhone || booking.customer?.phone || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Financial Details */}
                  <div className="lg:min-w-[280px]">
                    <div className="glass rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <span className="text-xs text-white/60">المبلغ الإجمالي</span>
                        <span className="text-lg font-black text-green-400">
                          {(booking.grossAmount || 0).toLocaleString()} ج.م
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                            <Wallet size={12} className="text-yellow-400" />
                          </div>
                          <span className="text-xs text-white/60">العربون</span>
                        </div>
                        <span className="text-sm font-bold text-yellow-400">
                          {(booking.depositAmount || 0).toLocaleString()} ج.م
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <CreditCard size={12} className="text-red-400" />
                          </div>
                          <span className="text-xs text-white/60">المتبقي</span>
                        </div>
                        <span className="text-sm font-bold text-red-400">
                          {(booking.remainingAmount || 0).toLocaleString()} ج.م
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-white/40 text-xs mb-1">تاريخ الفعالية</p>
                    <p className="font-semibold">
                      {new Date(booking.date).toLocaleDateString("ar-EG", { 
                        day: "numeric", 
                        month: "short" 
                      })}
                    </p>
                    <p className="text-xs text-white/50">{booking.timeSlot}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">المكان</p>
                    <p className="font-semibold">{booking.venue?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">تاريخ الحجز</p>
                    <p className="font-semibold text-xs">
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