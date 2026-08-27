import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  ArrowRight, 
  Calendar, 
  Clock, 
  MapPin, 
  Music,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Printer,
  Shield,
  User,
  DollarSign
} from "lucide-react"
import BookingActions from "./BookingActions"

export default async function AdminBookingDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
    redirect("/login")
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      artist: true,
      venue: true,
      customer: true,
    },
  })

  if (!booking) {
    redirect("/admin/bookings")
  }

  const depositAmount = booking.depositAmount || (booking.grossAmount || 0) * 0.2
  const remainingAmount = (booking.grossAmount || 0) - depositAmount

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return { color: "orange", icon: Clock, title: "في انتظار الموافقة", bg: "bg-orange-500/10", border: "border-orange-500/20" }
      case "APPROVED":
        return { color: "green", icon: CheckCircle2, title: "تمت الموافقة", bg: "bg-green-500/10", border: "border-green-500/20" }
      case "COMPLETED":
        return { color: "blue", icon: CheckCircle2, title: "مكتمل", bg: "bg-blue-500/10", border: "border-blue-500/20" }
      case "CANCELLED":
        return { color: "red", icon: XCircle, title: "ملغي", bg: "bg-red-500/10", border: "border-red-500/20" }
      default:
        return { color: "gray", icon: Clock, title: status, bg: "bg-white/5", border: "border-white/10" }
    }
  }

  const sc = getStatusConfig(booking.status)
  const StatusIcon = sc.icon

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin/bookings" 
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-4 transition-colors"
          >
            <ArrowRight size={16} className="rotate-180" />
            العودة لإدارة الحجوزات
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-black">تفاصيل الحجز</h1>
            <span className={`px-4 py-2 rounded-full text-sm font-bold border ${sc.bg} ${sc.border} text-${sc.color}-400`}>
              {sc.title}
            </span>
          </div>
          <p className="text-white/60 mt-2">رقم الحجز: #{booking.id.slice(0, 8).toUpperCase()}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Artist Info */}
            <div className="glass rounded-3xl p-6">
              <h3 className="text-sm text-white/40 uppercase mb-4 flex items-center gap-2">
                <Music size={16} />
                الفنان
              </h3>
              <div className="flex items-center gap-4">
                {booking.artist?.profileImage && (
                  <img 
                    src={booking.artist.profileImage} 
                    alt={booking.artist.name}
                    className="w-20 h-20 rounded-2xl object-cover"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">{booking.artist?.name}</h2>
                  <p className="text-white/60 text-sm">{booking.artist?.category}</p>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="glass rounded-3xl p-6">
              <h3 className="text-sm text-white/40 uppercase mb-4 flex items-center gap-2">
                <Calendar size={16} />
                تفاصيل الفعالية
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-white/40 mb-1">التاريخ</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Calendar size={14} className="text-yellow-400" />
                    {new Date(booking.date).toLocaleDateString("ar-EG", { 
                      weekday: "long",
                      day: "numeric", 
                      month: "long" 
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">الوقت</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Clock size={14} className="text-yellow-400" />
                    {booking.timeSlot}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-white/40 mb-1">المكان</p>
                  <p className="font-semibold flex items-center gap-2">
                    <MapPin size={14} className="text-yellow-400" />
                    {booking.venue?.name}
                  </p>
                  {booking.venue?.address && (
                    <p className="text-sm text-white/60 mr-6 mt-1">{booking.venue.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="glass rounded-3xl p-6">
              <h3 className="text-sm text-white/40 uppercase mb-4 flex items-center gap-2">
                <User size={16} />
                معلومات العميل
              </h3>
              <div className="space-y-3">
                <p className="flex items-center gap-2">
                  <User size={14} className="text-yellow-400" />
                  <span className="font-semibold">{booking.clientName}</span>
                </p>
                <p className="flex items-center gap-2 text-sm text-white/70">
                  <Phone size={14} className="text-yellow-400" />
                  {booking.clientPhone}
                </p>
                {booking.clientEmail && (
                  <p className="flex items-center gap-2 text-sm text-white/70">
                    <Mail size={14} className="text-yellow-400" />
                    {booking.clientEmail}
                  </p>
                )}
              </div>
            </div>

            {/* Admin Notes */}
            {booking.adminNotes && (
              <div className="glass rounded-3xl p-6 bg-yellow-500/5 border-yellow-500/20">
                <h3 className="text-sm text-white/40 uppercase mb-2 flex items-center gap-2">
                  <Shield size={16} />
                  ملاحظات الإدارة
                </h3>
                <p className="text-sm text-white/80">{booking.adminNotes}</p>
              </div>
            )}
          </div>

          {/* Sidebar - Actions */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <div className="glass rounded-3xl p-6">
              <h3 className="text-sm text-white/40 uppercase mb-4 flex items-center gap-2">
                <DollarSign size={16} />
                الملخص المالي
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">المبلغ الإجمالي</span>
                  <span className="font-bold text-lg">{(booking.grossAmount || 0).toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between text-sm text-green-400">
                  <span>العربون المطلوب</span>
                  <span className="font-bold">{depositAmount.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t border-white/10">
                  <span className="text-white/60">المتبقي</span>
                  <span className="font-bold text-yellow-400">{remainingAmount.toLocaleString()} ج.م</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <BookingActions 
              bookingId={booking.id}
              status={booking.status}
              artistName={booking.artist?.name || ""}
              clientName={booking.clientName}
              clientPhone={booking.clientPhone}
              clientEmail={booking.clientEmail || ""}
              depositAmount={depositAmount}
              totalAmount={booking.grossAmount || 0}
              date={new Date(booking.date).toLocaleDateString("ar-EG")}
              timeSlot={booking.timeSlot}
              venue={booking.venue?.name || ""}
            />

            {/* Invoice Link */}
            <Link 
              href={`/booking/${booking.id}/invoice`}
              className="glass hover:bg-white/[0.08] rounded-2xl p-4 flex items-center justify-center gap-2 transition-all"
            >
              <Printer size={18} className="text-yellow-400" />
              <span className="font-semibold text-sm">عرض وطباعة الفاتورة</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}