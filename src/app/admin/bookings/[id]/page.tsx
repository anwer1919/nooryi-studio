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
  CreditCard,
  FileText,
  Phone,
  Mail,
  Printer,
  Share2,
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
            bio: true,
          },
        },
        venue: {
          select: {
            name: true,
            address: true,
            city: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })
  } catch (error) {
    console.error("Error fetching booking:", error)
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-md">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الحجز غير موجود</h2>
          <p className="text-gray-600 mb-6">لا يمكن العثور على هذا الحجز في النظام.</p>
          <Link href="/admin/bookings" className="inline-block px-6 py-3 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition">
            العودة للحجوزات
          </Link>
        </div>
      </div>
    )
  }

  // التحقق من الصلاحيات
  const isOwner = booking.userId === session.user.id
  if (!isAdmin && !isOwner) {
    redirect("/")
  }

  // حساب المبالغ
  const grossAmount = Number(booking.grossAmount || 0)
  const platformFee = Math.round(grossAmount * 0.05)
  const taxAmount = Math.round(grossAmount * 0.14)
  const netAmount = grossAmount + taxAmount

  // حالة الحجز
  const statusConfig: any = {
    PENDING_APPROVAL: {
      label: "قيد المراجعة",
      color: "text-yellow-700",
      bg: "bg-yellow-100",
      border: "border-yellow-300",
      icon: Clock,
    },
    APPROVED: {
      label: "تمت الموافقة",
      color: "text-blue-700",
      bg: "bg-blue-100",
      border: "border-blue-300",
      icon: CheckCircle2,
    },
    CONFIRMED: {
      label: "مؤكد",
      color: "text-green-700",
      bg: "bg-green-100",
      border: "border-green-300",
      icon: CheckCircle2,
    },
    COMPLETED: {
      label: "مكتمل",
      color: "text-green-700",
      bg: "bg-green-100",
      border: "border-green-300",
      icon: CheckCircle2,
    },
    CANCELLED: {
      label: "ملغي",
      color: "text-red-700",
      bg: "bg-red-100",
      border: "border-red-300",
      icon: XCircle,
    },
    REJECTED: {
      label: "مرفوض",
      color: "text-red-700",
      bg: "bg-red-100",
      border: "border-red-300",
      icon: XCircle,
    },
  }

  const status = statusConfig[booking.status] || statusConfig.PENDING_APPROVAL
  const StatusIcon = status.icon

  // حالة الدفع
  const paymentStatusConfig: any = {
    PENDING: { label: "غير مدفوع", color: "text-yellow-700", bg: "bg-yellow-100" },
    PARTIAL: { label: "مدفوع جزئياً", color: "text-blue-700", bg: "bg-blue-100" },
    PAID: { label: "مدفوع بالكامل", color: "text-green-700", bg: "bg-green-100" },
    REFUNDED: { label: "مسترد", color: "text-gray-700", bg: "bg-gray-100" },
  }

  const paymentStatus = paymentStatusConfig[booking.paymentStatus] || paymentStatusConfig.PENDING

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
              <h1 className="text-3xl font-black text-gray-900 mb-2">تفاصيل الحجز</h1>
              <p className="text-gray-500">
                رقم الحجز: <span className="font-mono font-bold text-purple-700">{booking.id.slice(0, 8)}</span>
              </p>
            </div>

            {/* شارة الحالة */}
            <div className={`${status.bg} ${status.color} ${status.border} border-2 px-6 py-3 rounded-xl font-bold flex items-center gap-2`}>
              <StatusIcon size={24} />
              <span className="text-lg">{status.label}</span>
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-3">
            {/* زر عرض الفاتورة */}
            <Link
              href={`/booking/${booking.id}/invoice/print`}
              target="_blank"
              className="flex items-center gap-2 px-6 py-3 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition shadow-lg hover:shadow-xl"
            >
              <FileText size={20} />
              عرض الفاتورة
            </Link>

            {/* زر الموافقة (إذا كان معلق) */}
            {booking.status === "PENDING_APPROVAL" && isAdmin && (
              <Link
                href={`/admin/bookings/${booking.id}/approve`}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg"
              >
                <CheckCircle2 size={20} />
                موافقة
              </Link>
            )}

            {/* زر الرفض (إذا كان معلق) */}
            {booking.status === "PENDING_APPROVAL" && isAdmin && (
              <Link
                href={`/admin/bookings/${booking.id}/reject`}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg"
              >
                <XCircle size={20} />
                رفض
              </Link>
            )}

            {/* زر تأكيد الدفع */}
            {booking.status === "APPROVED" && booking.paymentStatus === "PENDING" && isAdmin && (
              <Link
                href={`/admin/bookings/${booking.id}/confirm-payment`}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg"
              >
                <CreditCard size={20} />
                تأكيد الدفع
              </Link>
            )}
          </div>
        </div>

        {/* معلومات الحجز */}
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
                <p className="font-bold text-gray-900">{booking.user?.name || booking.clientName}</p>
              </div>
              
              {booking.user?.email && (
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <p className="text-sm text-gray-700">{booking.user.email}</p>
                </div>
              )}
              
              {(booking.user?.phone || booking.clientPhone) && (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <p className="text-sm text-gray-700" dir="ltr">
                    {booking.user?.phone || booking.clientPhone}
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

            <div className="flex items-center gap-4 mb-4">
              {booking.artist?.profileImage ? (
                <img
                  src={booking.artist.profileImage}
                  alt={booking.artist.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-2xl">
                  {booking.artist?.name?.charAt(0) || "ف"}
                </div>
              )}
              <div>
                <p className="font-bold text-gray-900 text-lg">{booking.artist?.name}</p>
                <p className="text-sm text-purple-700">{booking.artist?.category}</p>
              </div>
            </div>

            {booking.artist?.bio && (
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">نبذة</p>
                <p className="text-sm text-gray-700 line-clamp-3">{booking.artist.bio}</p>
              </div>
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

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">اسم المكان</p>
                <p className="font-bold text-gray-900">{booking.venue?.name || "غير محدد"}</p>
              </div>
              
              {booking.venue?.address && (
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">العنوان</p>
                  <p className="text-sm text-gray-700">{booking.venue.address}</p>
                </div>
              )}
              
              {booking.venue?.city && (
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">المدينة</p>
                  <p className="text-sm text-gray-700">{booking.venue.city}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* تفاصيل الحجز والمبالغ */}
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
                <span className="font-bold text-gray-900">{eventDate}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">تاريخ الحجز:</span>
                <span className="font-bold text-gray-900">{createdAt}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">طريقة الدفع:</span>
                <span className="font-bold text-gray-900">{booking.paymentMethod || "بطاقة ائتمان"}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">حالة الدفع:</span>
                <span className={`${paymentStatus.bg} ${paymentStatus.color} px-3 py-1 rounded-lg text-sm font-bold`}>
                  {paymentStatus.label}
                </span>
              </div>

              {booking.notes && (
                <div>
                  <p className="text-gray-600 font-medium mb-2">ملاحظات:</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{booking.notes}</p>
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
                <span className="text-gray-600 font-medium">المجموع الفرعي:</span>
                <span className="font-bold text-gray-900 text-lg">{grossAmount.toLocaleString()} ج.م</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">ضريبة القيمة المضافة (14%):</span>
                <span className="font-bold text-gray-700">{taxAmount.toLocaleString()} ج.م</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">رسوم المنصة (5%):</span>
                <span className="font-bold text-red-600">{platformFee.toLocaleString()} ج.م</span>
              </div>
            </div>

            <div className="bg-gradient-to-l from-purple-700 to-purple-900 text-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">الإجمالي النهائي:</span>
                <span className="font-black text-3xl">{netAmount.toLocaleString()} ج.م</span>
              </div>
            </div>
          </div>
        </div>

        {/* زر عرض الفاتورة (سفلي) */}
        <div className="mt-8 bg-gradient-to-l from-purple-50 to-white p-6 rounded-2xl border-2 border-purple-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900 text-xl mb-2">هل تحتاج فاتورة رسمية؟</h3>
              <p className="text-gray-600">يمكنك عرض وطباعة الفاتورة الرسمية لهذا الحجز</p>
            </div>
            <Link
              href={`/booking/${booking.id}/invoice/print`}
              target="_blank"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <Printer size={24} />
              عرض الفاتورة الرسمية
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}