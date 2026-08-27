import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import BookingActions from "./BookingActions"
import { 
  ArrowRight, 
  Calendar, 
  Clock, 
  MapPin, 
  Music,
  User,
  Phone,
  Mail,
  DollarSign,
  CreditCard,
  CheckCircle2,
  FileText
} from "lucide-react"

export const dynamic = "force-dynamic"

// دالة مساعدة آمنة لتجنب Hydration mismatch
function formatSimpleDate(date: Date | string): string {
  try {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return "تاريخ غير صالح"
  }
}

export default async function AdminBookingDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  const session = await getServerSession(authOptions)
  
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
    redirect("/login")
  }

  // جلب الحجز
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
            city: true,
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
    })
  } catch (error) {
    console.error("❌ Error fetching booking:", error)
    redirect("/admin/bookings")
  }

  if (!booking) {
    redirect("/admin/bookings")
  }

  const grossAmount = booking.grossAmount || 0
  const paidAmount = booking.depositAmount || 0
  const remainingAmount = booking.remainingAmount || (grossAmount - paidAmount)

  const statusMap: Record<string, { title: string; color: string; bg: string; border: string }> = {
    "PENDING_APPROVAL": { title: "في انتظار الموافقة", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    "APPROVED": { title: "تمت الموافقة", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
    "COMPLETED": { title: "مكتمل", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    "CANCELLED": { title: "ملغي", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  }

  const timeSlotMap: Record<string, string> = {
    "MORNING": "صباحاً",
    "AFTERNOON": "ظهيرة",
    "EVENING": "مساءً",
    "NIGHT": "ليلاً",
  }

  const status = statusMap[booking.status] || { 
    title: booking.status, 
    color: "text-white", 
    bg: "bg-white/5", 
    border: "border-white/10" 
  }
  const timeSlotText = timeSlotMap[booking.timeSlot] || booking.timeSlot
  const dateStr = formatSimpleDate(booking.date)

  return (
    <div className="min-h-screen bg-black text-white" suppressHydrationWarning>
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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-black mb-2">تفاصيل الحجز</h1>
              <p className="text-white/60 font-mono text-sm">
                رقم الحجز: #{booking.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold border ${status.bg} ${status.border} ${status.color}`}>
              {status.title}
            </span>
          </div>
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
                {booking.artist?.profileImage ? (
                  <img 
                    src={booking.artist.profileImage} 
                    alt={booking.artist.name}
                    className="w-20 h-20 rounded-2xl object-cover"
                    suppressHydrationWarning
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
                    <Music className="text-yellow-400" size={32} />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold mb-1">{booking.artist?.name || "فنان"}</h2>
                  <p className="text-white/60 text-sm">{booking.artist?.category || "غير محدد"}</p>
                  <Link 
                    href={`/artists/${booking.artist?.slug}`}
                    className="text-xs text-yellow-400 hover:underline mt-1 inline-block"
                  >
                    عرض صفحة الفنان ←
                  </Link>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="glass rounded-3xl p-6">
              <h3 className="text-sm text-white/40 uppercase mb-4">تفاصيل الفعالية</h3>
              <div className="grid grid-cols-2 gap-4" suppressHydrationWarning>
                <div>
                  <p className="text-xs text-white/40 mb-1">التاريخ</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Calendar size={14} className="text-yellow-400" />
                    <span suppressHydrationWarning>{dateStr}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">الوقت</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Clock size={14} className="text-yellow-400" />
                    {timeSlotText}
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
                  <a href={`tel:${booking.clientPhone}`} className="hover:text-yellow-400">
                    {booking.clientPhone}
                  </a>
                </p>
                {booking.clientEmail && (
                  <p className="flex items-center gap-2 text-sm text-white/70">
                    <Mail size={14} className="text-yellow-400" />
                    <a href={`mailto:${booking.clientEmail}`} className="hover:text-yellow-400">
                      {booking.clientEmail}
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* Payment History */}
            {booking.payments && booking.payments.length > 0 && (
              <div className="glass rounded-3xl p-6">
                <h3 className="text-sm text-white/40 uppercase mb-4 flex items-center gap-2">
                  <CreditCard size={16} />
                  سجل الدفعات ({booking.payments.length})
                </h3>
                <div className="space-y-2">
                  {booking.payments.map((payment, index) => (
                    <div 
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          payment.status === "COMPLETED" 
                            ? "bg-green-500/10" 
                            : payment.status === "PENDING"
                            ? "bg-yellow-500/10"
                            : "bg-red-500/10"
                        }`}>
                          <CheckCircle2 
                            size={14} 
                            className={
                              payment.status === "COMPLETED" ? "text-green-400" :
                              payment.status === "PENDING" ? "text-yellow-400" :
                              "text-red-400"
                            }
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{payment.notes || `دفعة ${index + 1}`}</p>
                          <p className="text-xs text-white/40">{payment.method}</p>
                        </div>
                      </div>
                      <p className="font-bold text-green-400" suppressHydrationWarning>
                        {payment.amount.toLocaleString()} ج.م
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <div className="glass rounded-3xl p-6">
              <h3 className="text-sm text-white/40 uppercase mb-4 flex items-center gap-2">
                <DollarSign size={16} />
                الملخص المالي
              </h3>
              <div className="space-y-3" suppressHydrationWarning>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">المبلغ الإجمالي</span>
                  <span className="font-bold text-lg">{grossAmount.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between text-sm text-green-400">
                  <span>المبلغ المدفوع</span>
                  <span className="font-bold">{paidAmount.toLocaleString()} ج.م</span>
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
              depositAmount={paidAmount}
              totalAmount={grossAmount}
              date={dateStr}
              timeSlot={timeSlotText}
              venue={booking.venue?.name || ""}
            />

            {/* Invoice Link */}
            <Link 
              href={`/booking/${booking.id}/invoice`}
              target="_blank"
              className="glass hover:bg-white/[0.08] rounded-2xl p-4 flex items-center justify-center gap-2 transition-all border border-yellow-500/20"
            >
              <FileText size={18} className="text-yellow-400" />
              <span className="font-semibold text-sm">عرض وطباعة الفاتورة</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}