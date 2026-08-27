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
  Phone,
  Mail,
  DollarSign
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function BookingDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=/booking/${id}`)
  }

  let booking
  try {
    booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            category: true,
            profileImage: true,
            slug: true,
          },
        },
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    })
  } catch (error) {
    console.error("Error fetching booking:", error)
    redirect("/my-bookings")
  }

  if (!booking) {
    redirect("/my-bookings")
  }

  // التحقق من الملكية
  const isOwner = booking.clientEmail === session.user.email
  const isAdmin = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN"
  
  if (!isOwner && !isAdmin) {
    redirect("/my-bookings")
  }

  const deposit = booking.depositAmount || (booking.grossAmount || 0) * 0.2
  const remaining = (booking.grossAmount || 0) - deposit

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return { 
          color: "orange", 
          icon: Clock, 
          title: "في انتظار الموافقة", 
          description: "تم استلام طلبك وجاري مراجعته من قبل الإدارة",
          bg: "bg-orange-500/10",
          border: "border-orange-500/20"
        }
      case "APPROVED":
        return { 
          color: "green", 
          icon: CheckCircle2, 
          title: "تمت الموافقة ✅", 
          description: "تم تأكيد حجزك بنجاح، يمكنك إكمال الدفع",
          bg: "bg-green-500/10",
          border: "border-green-500/20"
        }
      case "COMPLETED":
        return { 
          color: "blue", 
          icon: CheckCircle2, 
          title: "مكتمل", 
          description: "تمت الفعالية بنجاح",
          bg: "bg-blue-500/10",
          border: "border-blue-500/20"
        }
      case "CANCELLED":
        return { 
          color: "red", 
          icon: XCircle, 
          title: "ملغي", 
          description: "تم إلغاء هذا الحجز",
          bg: "bg-red-500/10",
          border: "border-red-500/20"
        }
      default:
        return { 
          color: "gray", 
          icon: AlertCircle, 
          title: status, 
          description: "",
          bg: "bg-white/5",
          border: "border-white/10"
        }
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
        <div className={`glass rounded-3xl p-8 mb-8 border ${sc.border}`}>
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-2xl ${sc.bg} border ${sc.border} flex items-center justify-center flex-shrink-0`}>
              <StatusIcon className={`text-${sc.color}-400`} size={32} />
            </div>
            <div className="flex-1">
              <h2 className={`text-2xl font-black mb-2 text-${sc.color}-400`}>{sc.title}</h2>
              <p className="text-white/70">{sc.description}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Artist Info */}
            <div className="glass rounded-3xl p-6">
              <h3 className="text-sm text-white/40 uppercase mb-4 flex items-center gap-2">
                <Music size={16} />
                الفنان
              </h3>
              <div className="flex items-center gap-4">
                {booking.artist?.profileImage ? (
                  <img 
                    src={booking.artist.profileImage} 
                    alt={booking.artist.name}
                    className="w-20 h-20 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
                    <Music className="text-yellow-400" size={32} />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">{booking.artist?.name}</h2>
                  <p className="text-white/60 text-sm">{booking.artist?.category}</p>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="glass rounded-3xl p-6">
              <h3 className="text-sm text-white/40 uppercase mb-4">تفاصيل الفعالية</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-white/40 mb-1">التاريخ</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Calendar size={14} className="text-yellow-400" />
                    {new Date(booking.date).toLocaleDateString("ar-EG", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">الوقت</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Clock size={14} className="text-yellow-400" />
                    {booking.timeSlot === "MORNING" && "صباحاً"}
                    {booking.timeSlot === "AFTERNOON" && "ظهيرة"}
                    {booking.timeSlot === "EVENING" && "مساءً"}
                    {booking.timeSlot === "NIGHT" && "ليلاً"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-white/40 mb-1">المكان</p>
                  <p className="font-semibold flex items-center gap-2">
                    <MapPin size={14} className="text-yellow-400" />
                    {booking.venue?.name || "غير محدد"}
                  </p>
                  {booking.venue?.address && (
                    <p className="text-sm text-white/60 mr-6 mt-1">{booking.venue.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="glass rounded-3xl p-6">
              <h3 className="text-sm text-white/40 uppercase mb-4 flex items-center gap-2">
                <DollarSign size={16} />
                حالة الدفع
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">المبلغ الإجمالي</span>
                  <span className="font-bold text-lg">{(booking.grossAmount || 0).toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between text-sm text-green-400">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    العربون (20%)
                  </span>
                  <span className="font-bold">{deposit.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t border-white/10">
                  <span className="text-white/60">المتبقي</span>
                  <span className="font-bold text-yellow-400">{remaining.toLocaleString()} ج.م</span>
                </div>
              </div>

              {/* Payment Actions */}
              {booking.status === "APPROVED" && remaining > 0 && (
                <div className="mt-6 pt-4 border-t border-white/10">
                  <Link 
                    href={`/booking/${booking.id}/payment`}
                    className="block w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold py-3 rounded-xl text-center hover:opacity-90 transition-all"
                  >
                    إكمال الدفع ({remaining.toLocaleString()} ج.م)
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
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
              </div>
            </div>

            {/* Client Info */}
            <div className="glass rounded-3xl p-6">
              <h3 className="text-sm text-white/40 uppercase mb-4">معلومات التواصل</h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm">
                  <Phone size={14} className="text-yellow-400" />
                  {booking.clientPhone}
                </p>
                {booking.clientEmail && (
                  <p className="flex items-center gap-2 text-sm">
                    <Mail size={14} className="text-yellow-400" />
                    {booking.clientEmail}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}