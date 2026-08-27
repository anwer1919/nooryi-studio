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
  AlertCircle,
  CreditCard,
  Wallet,
  Phone,
  Mail
} from "lucide-react"

export default async function BookingDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=/booking/${params.id}`)
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      artist: true,
      venue: true,
    },
  })

  if (!booking) {
    redirect("/my-bookings")
  }

  // التحقق من أن المستخدم هو صاحب الحجز (عبر البريد الإلكتروني)
  if (booking.clientEmail !== session.user.email) {
    redirect("/my-bookings")
  }

  const deposit = booking.depositAmount || (booking.grossAmount || 0) * 0.2
  const remaining = (booking.grossAmount || 0) - deposit
  const isApproved = booking.status === "APPROVED"
  const needsPayment = isApproved && remaining > 0

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return { color: "orange", icon: Clock, title: "في انتظار الموافقة", description: "تم استلام طلبك وجاري مراجعته من قبل الفنان" }
      case "APPROVED":
        return { color: "green", icon: CheckCircle2, title: "تمت الموافقة", description: "تم تأكيد حجزك بنجاح" }
      case "COMPLETED":
        return { color: "blue", icon: CheckCircle2, title: "مكتمل", description: "تمت الفعالية بنجاح" }
      case "CANCELLED":
        return { color: "red", icon: XCircle, title: "ملغي", description: "تم إلغاء هذا الحجز" }
      default:
        return { color: "gray", icon: AlertCircle, title: status, description: "" }
    }
  }

  const sc = getStatusConfig(booking.status)
  const StatusIcon = sc.icon

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/my-bookings" 
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-4 transition-colors"
          >
            <ArrowRight size={16} className="rotate-180" />
            العودة لحجوزاتي
          </Link>
          <h1 className="text-4xl font-black mb-2">تفاصيل الحجز</h1>
          <p className="text-white/60">رقم الحجز: #{booking.id.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* Status Banner */}
        <div className="glass rounded-3xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-${sc.color}-500/10 border border-${sc.color}-500/20 flex items-center justify-center flex-shrink-0`}>
              <StatusIcon className={`text-${sc.color}-400`} size={32} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black mb-2">{sc.title}</h2>
              <p className="text-white/70 mb-4">{sc.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-white/60">
                  <CheckCircle2 size={14} className="text-green-400" />
                  <span>تم استلام العربون</span>
                </div>
                <div className={`flex items-center gap-2 ${isApproved ? "text-white/60" : "text-white/30"}`}>
                  {isApproved ? <CheckCircle2 size={14} className="text-green-400" /> : <Clock size={14} />}
                  <span>في انتظار موافقة الفنان</span>
                </div>
                <div className={`flex items-center gap-2 ${needsPayment ? "text-yellow-400" : "text-white/30"}`}>
                  <CreditCard size={14} />
                  <span>إكمال الدفع المتبقي</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Artist */}
            <div className="glass rounded-3xl p-6">
              <h3 className="text-sm text-white/40 uppercase mb-4">الفنان</h3>
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
                  <p className="text-white/60 text-sm mb-3">{booking.artist?.category}</p>
                  <p className="text-sm text-white/70 line-clamp-2">{booking.artist?.bio || "لا توجد سيرة ذاتية"}</p>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="glass rounded-3xl p-6">
              <h3 className="text-sm text-white/40 uppercase mb-4">تفاصيل الفعالية</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-white/40 mb-1">التاريخ</p>
                  <p className="flex items-center gap-2 font-semibold">
                    <Calendar size={14} className="text-yellow-400" />
                    {new Date(booking.date).toLocaleDateString("ar-EG", { 
                      weekday: "short",
                      day: "numeric", 
                      month: "long" 
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">الوقت</p>
                  <p className="flex items-center gap-2 font-semibold">
                    <Clock size={14} className="text-yellow-400" />
                    {booking.timeSlot}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-white/40 mb-1">المكان</p>
                  <p className="flex items-center gap-2 font-semibold">
                    <MapPin size={14} className="text-yellow-400" />
                    {booking.venue?.name}
                  </p>
                  {booking.venue?.address && (
                    <p className="text-sm text-white/60 mr-6 mt-1">{booking.venue.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="glass rounded-3xl p-6">
              <h3 className="text-sm text-white/40 uppercase mb-4">حالة الدفع</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">المبلغ الإجمالي</span>
                  <span className="font-semibold">{(booking.grossAmount || 0).toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between text-sm text-green-400">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    العربون (مدفوع)
                  </span>
                  <span className="font-bold">{deposit.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t border-white/10">
                  <span className="text-white/60">المتبقي</span>
                  <span className="font-bold text-yellow-400">{remaining.toLocaleString()} ج.م</span>
                </div>
              </div>

              {needsPayment && (
                <Link 
                  href={`/booking/${booking.id}/payment`}
                  className="group relative block mt-6"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-xl opacity-75 group-hover:opacity-100 blur transition-all" />
                  <div className="relative bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold py-3 rounded-xl text-center">
                    <span className="flex items-center justify-center gap-2">
                      <Wallet size={16} />
                      إكمال الدفع المتبقي
                    </span>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass rounded-3xl p-6">
              <h3 className="text-sm text-white/40 uppercase mb-4">إجراءات سريعة</h3>
              <div className="space-y-2">
                <Link 
                  href={`/booking/${booking.id}/invoice`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <CreditCard size={18} className="text-yellow-400" />
                  <span className="text-sm">عرض الإيصال</span>
                </Link>
                <a 
                  href={`mailto:support@nooryi.com?subject=استفسار عن حجز ${booking.id.slice(0, 8)}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Mail size={18} className="text-yellow-400" />
                  <span className="text-sm">تواصل مع الدعم</span>
                </a>
                <a 
                  href="tel:+201234567890"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Phone size={18} className="text-yellow-400" />
                  <span className="text-sm">اتصل بنا</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}