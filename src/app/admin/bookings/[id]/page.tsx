import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Music,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Phone,
  Mail,
  CreditCard,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function BookingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const userRole = session.user.role || "USER"
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  const isManager = userRole === "ARTIST_MANAGER"

  if (!isAdmin && !isManager) {
    redirect("/")
  }

  const { id } = await params

  let booking: any = null
  let errorMessage: string | null = null

  try {
    booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            profileImage: true,
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
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
      },
    })
  } catch (error: any) {
    console.error("Error fetching booking:", error)
    errorMessage = error.message
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-md">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الحجز غير موجود</h2>
          <p className="text-gray-600 mb-4">
            {errorMessage || "لا يمكن العثور على هذا الحجز في النظام."}
          </p>
          <Link
            href="/admin/bookings"
            className="inline-block px-6 py-3 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition"
          >
            العودة للحجوزات
          </Link>
        </div>
      </div>
    )
  }

  // حساب المبالغ بأمان
  const grossAmount = Number(booking.grossAmount || 0)
  const depositAmount = Number(booking.depositAmount || 0)
  const remainingAmount = Number(booking.remainingAmount || 0)
  const platformFee = Math.round(grossAmount * 0.05)
  const taxAmount = Math.round(grossAmount * 0.14)

  // حالة الحجز
  const statusConfig: any = {
    PENDING_APPROVAL: {
      label: "قيد المراجعة",
      color: "bg-yellow-100 text-yellow-700 border-yellow-300",
      icon: Clock,
    },
    APPROVED: {
      label: "تمت الموافقة",
      color: "bg-blue-100 text-blue-700 border-blue-300",
      icon: CheckCircle2,
    },
    CONFIRMED: {
      label: "مؤكد",
      color: "bg-green-100 text-green-700 border-green-300",
      icon: CheckCircle2,
    },
    COMPLETED: {
      label: "مكتمل",
      color: "bg-green-100 text-green-700 border-green-300",
      icon: CheckCircle2,
    },
    CANCELLED: {
      label: "ملغي",
      color: "bg-red-100 text-red-700 border-red-300",
      icon: XCircle,
    },
    REJECTED: {
      label: "مرفوض",
      color: "bg-red-100 text-red-700 border-red-300",
      icon: XCircle,
    },
  }

  const status = statusConfig[booking.status] || statusConfig.PENDING_APPROVAL
  const StatusIcon = status.icon

  // حالة الدفع
  const paymentStatus =
    remainingAmount === 0 && depositAmount > 0
      ? { label: "مدفوع بالكامل", color: "bg-green-100 text-green-700" }
      : depositAmount > 0
      ? { label: "مدفوع جزئياً", color: "bg-blue-100 text-blue-700" }
      : { label: "غير مدفوع", color: "bg-yellow-100 text-yellow-700" }

  // التواريخ
  const eventDate = new Date(booking.date).toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const createdAt = new Date(booking.createdAt).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  // تحديد اسم العميل
  const clientName =
    booking.customer?.fullName ||
    booking.clientName ||
    "غير محدد"

  const clientEmail =
    booking.customer?.email || booking.clientEmail || null

  const clientPhone =
    booking.customer?.phone || booking.clientPhone || null

  // وقت الحجز
  const timeSlotLabels: any = {
    MORNING: "صباحاً",
    AFTERNOON: "ظهراً",
    EVENING: "مساءً",
    NIGHT: "ليلاً",
  }
  const timeSlotLabel = timeSlotLabels[booking.timeSlot] || booking.timeSlot || "غير محدد"

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8 pt-20 lg:pt-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-800 font-semibold mb-4 transition"
          >
            <ArrowLeft size={20} />
            العودة للحجوزات
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">
                تفاصيل الحجز
              </h1>
              <p className="text-gray-500">
                رقم الحجز:{" "}
                <span className="font-mono font-bold text-purple-700">
                  {booking.id.slice(0, 8).toUpperCase()}
                </span>
              </p>
            </div>

            <div
              className={`${status.color} border-2 px-6 py-3 rounded-xl font-bold flex items-center gap-2`}
            >
              <StatusIcon size={24} />
              <span className="text-lg">{status.label}</span>
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/booking/${booking.id}/invoice/print`}
              target="_blank"
              className="flex items-center gap-2 px-6 py-3 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition shadow-lg hover:shadow-xl"
            >
              <FileText size={20} />
              عرض الفاتورة
            </Link>

            {booking.status === "PENDING_APPROVAL" && isAdmin && (
              <>
                <Link
                  href={`/admin/bookings/${booking.id}/approve`}
                  onClick={(e) => {
                    if (!confirm("هل أنت متأكد من الموافقة على هذا الحجز؟")) {
                      e.preventDefault()
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg"
                >
                  <CheckCircle2 size={20} />
                  موافقة
                </Link>
                <Link
                  href={`/admin/bookings/${booking.id}/reject`}
                  onClick={(e) => {
                    if (!confirm("هل أنت متأكد من رفض هذا الحجز؟")) {
                      e.preventDefault()
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg"
                >
                  <XCircle size={20} />
                  رفض
                </Link>
              </>
            )}

            {booking.status === "APPROVED" && remainingAmount > 0 && isAdmin && (
              <Link
                href={`/admin/bookings/${booking.id}/confirm-payment`}
                onClick={(e) => {
                  if (!confirm("هل تريد تأكيد الدفع بالكامل لهذا الحجز؟")) {
                    e.preventDefault()
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg"
              >
                <CreditCard size={20} />
                تأكيد الدفع بالكامل
              </Link>
            )}

            {booking.status === "APPROVED" && isAdmin && (
              <Link
                href={`/admin/bookings/${booking.id}/complete`}
                onClick={(e) => {
                  if (!confirm("هل تريد تحديد هذا الحجز كمكتمل؟")) {
                    e.preventDefault()
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-lg"
              >
                <CheckCircle2 size={20} />
                تحديد كمكتمل
              </Link>
            )}
          </div>
        </div>

        {/* معلومات الحجز - 3 بطاقات */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* بيانات العميل */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white">
                <User size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">بيانات العميل</h3>
                <p className="text-xs text-gray-500">معلومات صاحب الحجز</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">الاسم</p>
                <p className="font-bold text-gray-900">{clientName}</p>
              </div>

              {clientEmail && (
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-700 truncate">{clientEmail}</p>
                </div>
              )}

              {clientPhone && (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-700" dir="ltr">
                    {clientPhone}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* بيانات الفنان */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white">
                <Music size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">الفنان</h3>
                <p className="text-xs text-gray-500">معلومات الفنان المحجوز</p>
              </div>
            </div>

            {booking.artist ? (
              <div className="flex items-center gap-4">
                {booking.artist.profileImage ? (
                  <img
                    src={booking.artist.profileImage}
                    alt={booking.artist.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-2xl">
                    {booking.artist.name?.charAt(0) || "ف"}
                  </div>
                )}
                <div>
                  <Link
                    href={`/admin/artists/${booking.artist.slug}`}
                    className="font-bold text-gray-900 text-lg hover:text-purple-700 transition"
                  >
                    {booking.artist.name}
                  </Link>
                  <p className="text-sm text-purple-700">
                    {booking.artist.category}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">لا توجد معلومات عن الفنان</p>
            )}
          </div>

          {/* بيانات المكان */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">مكان الفعالية</h3>
                <p className="text-xs text-gray-500">تفاصيل الموقع</p>
              </div>
            </div>

            {booking.venue ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">
                    اسم المكان
                  </p>
                  <p className="font-bold text-gray-900">{booking.venue.name}</p>
                </div>

                {booking.venue.address && (
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">
                      العنوان
                    </p>
                    <p className="text-sm text-gray-700">{booking.venue.address}</p>
                  </div>
                )}

                {booking.venue.city && (
                  <div>
                    <p className="text-xs text-gray-500 font-semibold mb-1">
                      المدينة
                    </p>
                    <p className="text-sm text-gray-700">{booking.venue.city}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">لا توجد معلومات عن المكان</p>
            )}
          </div>
        </div>

        {/* تفاصيل الحجز والمبالغ - 2 أعمدة */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* تفاصيل الحجز */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 text-xl mb-6 pb-4 border-b border-gray-200 flex items-center gap-2">
              <Calendar size={24} className="text-purple-700" />
              تفاصيل الحجز
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">تاريخ الفعالية:</span>
                <span suppressHydrationWarning className="font-bold text-gray-900 text-right">
                  {eventDate}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">وقت الحجز:</span>
                <span className="font-bold text-gray-900">{timeSlotLabel}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">تاريخ الإنشاء:</span>
                <span suppressHydrationWarning className="font-bold text-gray-900 text-sm">
                  {createdAt}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">حالة الدفع:</span>
                <span
                  className={`${paymentStatus.color} px-3 py-1 rounded-lg text-sm font-bold`}
                >
                  {paymentStatus.label}
                </span>
              </div>

              {booking.adminNotes && (
                <div>
                  <p className="text-gray-600 font-medium mb-2">
                    ملاحظات الإدارة:
                  </p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {booking.adminNotes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* الملخص المالي */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 text-xl mb-6 pb-4 border-b border-gray-200 flex items-center gap-2">
              <DollarSign size={24} className="text-purple-700" />
              الملخص المالي
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">المبلغ الإجمالي:</span>
                <span className="font-bold text-gray-900 text-lg">
                  {grossAmount.toLocaleString()} ج.م
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">
                  العربون المدفوع:
                </span>
                <span className="font-bold text-green-600 text-lg">
                  {depositAmount.toLocaleString()} ج.م
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">المبلغ المتبقي:</span>
                <span
                  className={`font-bold text-lg ${
                    remainingAmount > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {remainingAmount.toLocaleString()} ج.م
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">
                  رسوم المنصة (5%):
                </span>
                <span className="font-bold text-gray-700">
                  {platformFee.toLocaleString()} ج.م
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">
                  ضريبة القيمة المضافة (14%):
                </span>
                <span className="font-bold text-gray-700">
                  {taxAmount.toLocaleString()} ج.م
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-l from-purple-700 to-purple-900 text-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">الإجمالي النهائي:</span>
                <span className="font-black text-3xl">
                  {(grossAmount + taxAmount).toLocaleString()} ج.م
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* زر عرض الفاتورة (سفلي) */}
        <div className="mt-8 bg-gradient-to-l from-purple-50 to-white p-6 rounded-2xl border-2 border-purple-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900 text-xl mb-2">
                هل تحتاج فاتورة رسمية؟
              </h3>
              <p className="text-gray-600">
                يمكنك عرض وطباعة الفاتورة الرسمية لهذا الحجز
              </p>
            </div>
            <Link
              href={`/booking/${booking.id}/invoice/print`}
              target="_blank"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <FileText size={24} />
              عرض الفاتورة الرسمية
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}