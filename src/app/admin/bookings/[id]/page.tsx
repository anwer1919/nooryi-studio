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
  AlertTriangle
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminBookingDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> | { id: string }
}) {
  // ✅ معالجة Next.js 14 و 15
  const resolvedParams = await Promise.resolve(params)
  const id = resolvedParams.id

  console.log("🔍 Booking ID from params:", id)

  // التحقق من الصلاحيات
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    console.log("❌ No session")
    redirect("/login")
  }

  const isAdmin = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN"
  if (!isAdmin) {
    console.log("❌ Not admin, role:", session.user.role)
    redirect("/admin/bookings")
  }

  // ✅ جلب الحجز بدون try/catch لرؤية الأخطاء
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      artist: {
        select: { 
          id: true,
          name: true, 
          category: true, 
          profileImage: true, 
          slug: true 
        },
      },
      venue: {
        select: { 
          id: true,
          name: true, 
          address: true 
        },
      },
    },
  })

  // ✅ عرض معلومات تشخيصية إذا لم يوجد الحجز
  if (!booking) {
    console.log("❌ Booking not found for ID:", id)
    
    // جلب جميع الحجوزات لعرضها كـ debug
    const allBookings = await prisma.booking.findMany({
      take: 5,
      select: { id: true, clientName: true, status: true },
    })
    
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Link 
            href="/admin/bookings" 
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8"
          >
            <ArrowRight size={16} className="rotate-180" />
            العودة
          </Link>

          <div className="glass rounded-3xl p-8 border border-red-500/20 bg-red-500/5">
            <div className="flex items-start gap-4 mb-6">
              <AlertTriangle className="text-red-400 flex-shrink-0" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-red-400 mb-2">
                  الحجز غير موجود
                </h1>
                <p className="text-white/70">
                  لم يتم العثور على حجز بالمعرف: <code className="bg-white/10 px-2 py-1 rounded">{id}</code>
                </p>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 mb-4">
              <p className="text-sm text-white/60 mb-3">🔍 الحجوزات الموجودة في قاعدة البيانات:</p>
              <div className="space-y-2">
                {allBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <div>
                      <code className="text-xs text-yellow-400">{b.id}</code>
                      <p className="text-sm">{b.clientName} - {b.status}</p>
                    </div>
                    <Link 
                      href={`/admin/bookings/${b.id}`}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      جرب هذا ←
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <Link 
              href="/admin/bookings"
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400"
            >
              العودة لقائمة الحجوزات
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ✅ الحجز موجود - عرض التفاصيل
  console.log("✅ Booking found:", booking.id)

  const grossAmount = booking.grossAmount || 0
  const depositAmount = booking.depositAmount || grossAmount * 0.2
  const remainingAmount = booking.remainingAmount || (grossAmount - depositAmount)

  const statusMap: Record<string, { title: string; color: string; bg: string }> = {
    "PENDING_APPROVAL": { title: "في انتظار الموافقة", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
    "APPROVED": { title: "تمت الموافقة", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
    "COMPLETED": { title: "مكتمل", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    "CANCELLED": { title: "ملغي", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
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
    bg: "bg-white/5 border-white/10" 
  }
  const timeSlotText = timeSlotMap[booking.timeSlot] || booking.timeSlot

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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-black mb-2">تفاصيل الحجز</h1>
              <p className="text-white/60 font-mono text-sm">ID: {booking.id}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold border ${status.bg} ${status.color}`}>
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
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
                    <Music className="text-yellow-400" size={32} />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold mb-1">{booking.artist?.name || "فنان"}</h2>
                  <p className="text-white/60 text-sm">{booking.artist?.category || "غير محدد"}</p>
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
                    {new Date(booking.date).toLocaleDateString("ar-EG")}
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
          </div>

          {/* Sidebar */}
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
                  <span className="font-bold">{grossAmount.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between text-sm text-green-400">
                  <span>العربون</span>
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
              totalAmount={grossAmount}
              date={new Date(booking.date).toLocaleDateString("ar-EG")}
              timeSlot={timeSlotText}
              venue={booking.venue?.name || ""}
            />
          </div>
        </div>
      </div>
    </div>
  )
}