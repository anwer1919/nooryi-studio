import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import {
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  FileText,
  Phone,
  User,
  Music,
  CreditCard,
  ArrowRight,
  Download,
  MessageCircle,
} from "lucide-react"

export const dynamic = "force-dynamic"

const statusConfig: Record<
  string,
  { label: string; color: string; icon: any; bg: string }
> = {
  PENDING_APPROVAL: {
    label: "قيد المراجعة",
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-200",
    icon: Clock,
  },
  APPROVED: {
    label: "تمت الموافقة",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    icon: CheckCircle2,
  },
  CONFIRMED: {
    label: "مؤكد",
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
    icon: CheckCircle2,
  },
  COMPLETED: {
    label: "مكتمل",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "ملغي",
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    icon: XCircle,
  },
  REJECTED: {
    label: "مرفوض",
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    icon: XCircle,
  },
}

const timeSlotMap: Record<string, string> = {
  MORNING: "صباحاً (8 صباحاً - 12 ظهراً)",
  AFTERNOON: "ظهيرة (12 ظهراً - 5 مساءً)",
  EVENING: "مساءً (5 مساءً - 10 مساءً)",
  NIGHT: "ليلاً (10 مساءً - 2 صباحاً)",
}

export default async function BookingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect(`/login?callbackUrl=/booking/${id}`)
  }

  // جلب الحجز مع العلاقات
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      artist: {
        select: {
          id: true,
          name: true,
          category: true,
          profileImage: true,
          slug: true,
          accentColor: true,
        },
      },
      venue: true,
    },
  })

  if (!booking) {
    notFound()
  }

  // التحقق من الصلاحيات
  const userRole = session.user.role || "USER"
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  const isManager = userRole === "ARTIST_MANAGER"
  const isOwner = booking.clientEmail === session.user.email

  // مدير الأعمال: يجب أن يكون مرتبطاً بالفنان
  let isArtistManager = false
  if (isManager) {
    const managerUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { artistId: true },
    })
    isArtistManager = managerUser?.artistId === booking.artistId
  }

  if (!isAdmin && !isOwner && !isArtistManager) {
    redirect("/my-bookings")
  }

  const status = statusConfig[booking.status] || statusConfig.PENDING_APPROVAL
  const StatusIcon = status.icon

  const eventDate = booking.date
    ? new Date(booking.date).toLocaleDateString("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "غير محدد"

  const grossAmount = booking.grossAmount || 0
  const paidAmount = booking.depositAmount || 0
  const remainingAmount = grossAmount - paidAmount
  const invoiceNumber = booking.id.slice(0, 8).toUpperCase()

  const accentColor = booking.artist?.accentColor || "#7c3aed"

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* شريط الإجراءات العلوي */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Link
                href="/my-bookings"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition"
              >
                <ArrowRight size={18} />
                العودة للحجوزات
              </Link>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500 font-mono">
                #{invoiceNumber}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/booking/${id}/invoice`}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition"
              >
                <FileText size={16} />
                عرض الفاتورة
              </Link>

              <Link
                href={`/booking/${id}/invoice/print`}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-bold transition shadow-lg"
                style={{ backgroundColor: accentColor }}
              >
                <Printer size={16} />
                طباعة PDF
              </Link>

              {isAdmin && (
                <Link
                  href={`/admin/bookings/${id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition"
                >
                  إدارة (أدمن)
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* البطاقة الرئيسية */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* رأس البطاقة مع لون الفنان */}
          <div
            className="p-6 sm:p-8 text-white"
            style={{
              background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
            }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                {booking.artist?.profileImage ? (
                  <img
                    src={booking.artist.profileImage}
                    alt={booking.artist.name}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30 shadow-xl"
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30"
                  >
                    <Music size={36} className="text-white" />
                  </div>
                )}
                <div>
                  <p className="text-white/80 text-sm font-semibold mb-1">
                    حجز فنان
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-black mb-1">
                    {booking.artist?.name || "فنان"}
                  </h1>
                  <p className="text-white/80 text-sm">
                    {booking.artist?.category || "فنان"}
                  </p>
                </div>
              </div>

              <div
                className={`${status.bg} ${status.color} px-4 py-2 rounded-xl inline-flex items-center gap-2 font-bold border-2`}
              >
                <StatusIcon size={18} />
                {status.label}
              </div>
            </div>
          </div>

          {/* تفاصيل الحجز */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* معلومات الفعالية */}
              <div className="space-y-4">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Calendar size={20} className="text-purple-700" />
                  تفاصيل الفعالية
                </h2>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-semibold mb-1">
                        تاريخ الفعالية
                      </p>
                      <p className="font-bold text-gray-900" suppressHydrationWarning>
                        {eventDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-semibold mb-1">
                        الفترة الزمنية
                      </p>
                      <p className="font-bold text-gray-900">
                        {timeSlotMap[booking.timeSlot] || booking.timeSlot}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-semibold mb-1">
                        مكان الفعالية
                      </p>
                      <p className="font-bold text-gray-900">
                        {booking.venue?.name || "غير محدد"}
                      </p>
                      {booking.venue?.address && (
                        <p className="text-sm text-gray-500 mt-1">
                          {booking.venue.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* معلومات العميل */}
              <div className="space-y-4">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-200">
                  <User size={20} className="text-purple-700" />
                  معلومات العميل
                </h2>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-semibold mb-1">
                        الاسم
                      </p>
                      <p className="font-bold text-gray-900">
                        {booking.clientName || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-semibold mb-1">
                        رقم الهاتف
                      </p>
                      <p className="font-bold text-gray-900" dir="ltr">
                        {booking.clientPhone || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MessageCircle size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-semibold mb-1">
                        البريد الإلكتروني
                      </p>
                      <p className="font-bold text-gray-900" dir="ltr">
                        {booking.clientEmail || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ملاحظات إضافية */}
            {booking.notes && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm font-bold text-yellow-800 mb-2">
                  ملاحظات إضافية:
                </p>
                <p className="text-sm text-yellow-900 whitespace-pre-line">
                  {booking.notes}
                </p>
              </div>
            )}

            {/* ملخص المبالغ */}
            <div className="mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 mb-4">
                <CreditCard size={20} className="text-purple-700" />
                ملخص المبالغ
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 font-semibold">
                    المبلغ الإجمالي
                  </span>
                  <span className="text-xl font-black text-gray-900">
                    {grossAmount.toLocaleString()} ج.م
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 font-semibold">
                    المدفوع (العربون)
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {paidAmount.toLocaleString()} ج.م
                  </span>
                </div>

                {remainingAmount > 0 && (
                  <div className="flex items-center justify-between py-3 border-t-2 border-gray-200 mt-3">
                    <span className="text-gray-900 font-black text-lg">
                      المتبقي
                    </span>
                    <span className="text-2xl font-black text-red-600">
                      {remainingAmount.toLocaleString()} ج.م
                    </span>
                  </div>
                )}

                {remainingAmount === 0 && (
                  <div className="flex items-center justify-center gap-2 py-3 bg-green-50 rounded-xl mt-3 border border-green-200">
                    <CheckCircle2 className="text-green-600" size={20} />
                    <span className="font-bold text-green-700">
                      تم السداد بالكامل
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* معلومات إضافية */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-gray-500 font-semibold mb-1">
                  رقم الحجز
                </p>
                <p className="font-mono font-bold text-gray-900 text-sm" dir="ltr">
                  #{invoiceNumber}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-gray-500 font-semibold mb-1">
                  تاريخ الإنشاء
                </p>
                <p className="font-bold text-gray-900 text-xs" suppressHydrationWarning>
                  {new Date(booking.createdAt).toLocaleDateString("ar-EG")}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-gray-500 font-semibold mb-1">
                  آخر تحديث
                </p>
                <p className="font-bold text-gray-900 text-xs" suppressHydrationWarning>
                  {new Date(booking.updatedAt).toLocaleDateString("ar-EG")}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-gray-500 font-semibold mb-1">
                  نوع الحجز
                </p>
                <p className="font-bold text-gray-900 text-xs">
                  {booking.timeSlot || "-"}
                </p>
              </div>
            </div>

            {/* أزرار الإجراءات السفلية */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/booking/${id}/invoice`}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition"
              >
                <FileText size={18} />
                عرض الفاتورة
              </Link>

              <Link
                href={`/booking/${id}/invoice/print`}
                target="_blank"
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition"
              >
                <Download size={18} />
                تحميل PDF
              </Link>

              {booking.clientPhone && (
                <a
                  href={`https://wa.me/${booking.clientPhone.replace(/\D/g, "")}`}
                  target="_blank"
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition"
                >
                  <MessageCircle size={18} />
                  تواصل واتساب
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}