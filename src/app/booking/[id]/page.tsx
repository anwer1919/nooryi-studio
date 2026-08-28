import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  ArrowRight, Calendar, Clock, MapPin, Music,
  CheckCircle2, XCircle, AlertCircle, CreditCard,
  Phone, Mail, DollarSign, FileText
} from "lucide-react"

export const dynamic = "force-dynamic"

function formatSafeDate(date: Date | string): string {
  try {
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  } catch {
    return "تاريخ غير صالح"
  }
}

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
        artist: { select: { id: true, name: true, category: true, profileImage: true, slug: true } },
        venue: { select: { id: true, name: true, address: true } },
        payments: { orderBy: { createdAt: "desc" } },
      },
    })
  } catch (error) {
    console.error("Error fetching booking:", error)
    redirect("/my-bookings")
  }

  if (!booking) redirect("/my-bookings")

  const isOwner = booking.clientEmail === session.user.email
  const isAdmin = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN"
  
  if (!isOwner && !isAdmin) redirect("/my-bookings")

  const grossAmount = booking.grossAmount || 0
  const paidAmount = booking.depositAmount || 0
  const remainingAmount = booking.remainingAmount || (grossAmount - paidAmount)

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return { 
          icon: Clock, title: "في انتظار الموافقة", 
          description: "تم استلام طلبك وجاري مراجعته من قبل الإدارة",
          bg: "bg-orange-50 dark:bg-orange-500/10", border: "border-orange-200 dark:border-orange-500/20",
          text: "text-orange-600 dark:text-orange-400"
        }
      case "APPROVED":
        return { 
          icon: CheckCircle2, title: "تمت الموافقة ✅", 
          description: "تم تأكيد حجزك بنجاح، يمكنك إكمال الدفع",
          bg: "bg-accent/10 dark:bg-accent-dark/20", border: "border-accent/30 dark:border-accent-dark/30",
          text: "text-primary dark:text-accent"
        }
      case "COMPLETED":
        return { 
          icon: CheckCircle2, title: "مكتمل", 
          description: "تمت الفعالية بنجاح",
          bg: "bg-green-50 dark:bg-green-500/10", border: "border-green-200 dark:border-green-500/20",
          text: "text-green-600 dark:text-green-400"
        }
      case "CANCELLED":
        return { 
          icon: XCircle, title: "ملغي", 
          description: "تم إلغاء هذا الحجز",
          bg: "bg-red-50 dark:bg-red-500/10", border: "border-red-200 dark:border-red-500/20",
          text: "text-red-600 dark:text-red-400"
        }
      default:
        return { 
          icon: AlertCircle, title: status, description: "",
          bg: "bg-gray-50 dark:bg-white/5", border: "border-gray-200 dark:border-dark-border",
          text: "text-gray-600 dark:text-gray-400"
        }
    }
  }

  const timeSlotMap: Record<string, string> = {
    "MORNING": "صباحاً", "AFTERNOON": "ظهيرة", "EVENING": "مساءً", "NIGHT": "ليلاً",
  }

  const sc = getStatusConfig(booking.status)
  const StatusIcon = sc.icon

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/my-bookings" 
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-accent mb-4 transition-colors"
          >
            <ArrowRight size={16} className="rotate-180" />
            العودة لحجوزاتي
          </Link>
          <h1 className="text-4xl font-black text-primary dark:text-white mb-2">تفاصيل الحجز</h1>
          <p className="text-gray-500 dark:text-gray-400 font-mono text-sm">
            رقم الحجز: #{booking.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* Status Banner */}
        <div className={`card-premium mb-8 border ${sc.border} ${sc.bg}`}>
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-2xl ${sc.bg} border ${sc.border} flex items-center justify-center flex-shrink-0`}>
              <StatusIcon className={sc.text} size={32} />
            </div>
            <div className="flex-1">
              <h2 className={`text-2xl font-black mb-2 ${sc.text}`}>{sc.title}</h2>
              <p className="text-gray-600 dark:text-gray-300">{sc.description}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Artist Info */}
            <div className="card-premium">
              <h3 className="text-sm text-gray-400 uppercase mb-4 flex items-center gap-2">
                <Music size={16} className="text-accent" />
                الفنان
              </h3>
              <div className="flex items-center gap-4">
                {booking.artist?.profileImage ? (
                  <img 
                    src={booking.artist.profileImage} 
                    alt={booking.artist.name}
                    className="w-20 h-20 rounded-2xl object-cover shadow-soft"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-accent/20 dark:bg-accent-dark/20 flex items-center justify-center">
                    <Music className="text-primary dark:text-accent" size={32} />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-primary dark:text-white mb-1">{booking.artist?.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{booking.artist?.category}</p>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="card-premium">
              <h3 className="text-sm text-gray-400 uppercase mb-4">تفاصيل الفعالية</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">التاريخ</p>
                  <p className="font-semibold text-primary dark:text-white flex items-center gap-2">
                    <Calendar size={14} className="text-accent" />
                    <span suppressHydrationWarning>{formatSafeDate(booking.date)}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">الوقت</p>
                  <p className="font-semibold text-primary dark:text-white flex items-center gap-2">
                    <Clock size={14} className="text-accent" />
                    {timeSlotMap[booking.timeSlot] || booking.timeSlot}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-1">المكان</p>
                  <p className="font-semibold text-primary dark:text-white flex items-center gap-2">
                    <MapPin size={14} className="text-accent" />
                    {booking.venue?.name || "غير محدد"}
                  </p>
                  {booking.venue?.address && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mr-6 mt-1">{booking.venue.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="card-premium">
              <h3 className="text-sm text-gray-400 uppercase mb-4 flex items-center gap-2">
                <DollarSign size={16} className="text-accent" />
                حالة الدفع
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">المبلغ الإجمالي</span>
                  <span className="font-bold text-lg text-primary dark:text-white">{grossAmount.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    المبلغ المدفوع
                  </span>
                  <span className="font-bold">{paidAmount.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t border-gray-100 dark:border-dark-border">
                  <span className="text-gray-500 dark:text-gray-400">المتبقي</span>
                  <span className="font-bold text-accent">{remainingAmount.toLocaleString()} ج.م</span>
                </div>
              </div>

              {booking.status === "APPROVED" && remainingAmount > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-dark-border">
                  <Link 
                    href={`/booking/${booking.id}/payment`}
                    className="btn-primary block w-full text-center"
                  >
                    إكمال الدفع ({remainingAmount.toLocaleString()} ج.م)
                  </Link>
                </div>
              )}
            </div>

            {/* Payment History */}
            {booking.payments && booking.payments.length > 0 && (
              <div className="card-premium">
                <h3 className="text-sm text-gray-400 uppercase mb-4 flex items-center gap-2">
                  <CreditCard size={16} className="text-accent" />
                  سجل المدفوعات
                </h3>
                <div className="space-y-2">
                  {booking.payments.map((payment, index) => (
                    <div 
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-background-subtle dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                          <CheckCircle2 size={14} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-primary dark:text-white">{payment.notes || `دفعة ${index + 1}`}</p>
                          <p className="text-xs text-gray-400">{payment.method}</p>
                        </div>
                      </div>
                      <p className="font-bold text-green-600 dark:text-green-400" suppressHydrationWarning>
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
            <div className="card-premium">
              <h3 className="text-sm text-gray-400 uppercase mb-4">إجراءات سريعة</h3>
              <div className="space-y-2">
                <Link 
                  href={`/booking/${booking.id}/invoice`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-accent/10 dark:bg-accent-dark/20 hover:bg-accent/20 transition-colors"
                >
                  <FileText size={18} className="text-primary dark:text-accent" />
                  <span className="text-sm font-semibold text-primary dark:text-white">عرض الفاتورة</span>
                </Link>
                <a 
                  href={`mailto:support@nooryi.com?subject=استفسار عن حجز ${booking.id.slice(0, 8)}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-background-subtle dark:bg-dark-surface hover:bg-accent/10 transition-colors"
                >
                  <Mail size={18} className="text-primary dark:text-accent" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">تواصل مع الدعم</span>
                </a>
              </div>
            </div>

            <div className="card-premium">
              <h3 className="text-sm text-gray-400 uppercase mb-4">معلومات التواصل</h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Phone size={14} className="text-accent" />
                  {booking.clientPhone}
                </p>
                {booking.clientEmail && (
                  <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Mail size={14} className="text-accent" />
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