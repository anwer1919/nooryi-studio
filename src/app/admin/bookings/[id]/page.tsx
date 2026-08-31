import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import {
  ArrowLeft, Calendar, MapPin, User, Music, DollarSign,
  CheckCircle2, XCircle, Clock, FileText, Phone, Mail, CreditCard,
} from "lucide-react"

export const dynamic = "force-dynamic"

// ✅ الحل الهندسي: إجبار المنطقة الزمنية على UTC يضمن تطابق النص بين الخادم والمتصفح 100%
const safeFormatDate = (dateInput: any, includeTime = false) => {
  if (!dateInput) return "غير محدد"
  try {
    const date = new Date(dateInput)
    if (isNaN(date.getTime())) return "تاريخ غير صالح"
    
    return date.toLocaleDateString("ar-EG", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      timeZone: "UTC", // <-- هذا هو السطر السحري الذي يمنع خطأ Hydration
      ...(includeTime ? { hour: "2-digit", minute: "2-digit", timeZone: "UTC" } : {}),
    })
  } catch (e) {
    return "غير محدد"
  }
}

export default async function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const userRole = session.user.role || "USER"
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  const isManager = userRole === "ARTIST_MANAGER"
  if (!isAdmin && !isManager) redirect("/")

  const { id } = await params
  let booking: any = null

  try {
    booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        artist: { select: { id: true, name: true, slug: true, category: true, profileImage: true } },
        venue: { select: { id: true, name: true, address: true, city: true } },
      },
    })
  } catch (error: any) {
    console.error("DB Error:", error.message)
  }

  if (!booking) {
    return (
      <div suppressHydrationWarning className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-md">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الحجز غير موجود</h2>
          <Link href="/admin/bookings" className="inline-block px-6 py-3 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition mt-4">العودة</Link>
        </div>
      </div>
    )
  }

  const grossAmount = Number(booking.grossAmount || 0)
  const depositAmount = Number(booking.depositAmount || 0)
  const remainingAmount = Number(booking.remainingAmount || 0)
  const platformFee = Math.round(grossAmount * 0.05)
  const taxAmount = Math.round(grossAmount * 0.14)

  const statusConfig: any = {
    PENDING_APPROVAL: { label: "قيد المراجعة", color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: Clock },
    APPROVED: { label: "تمت الموافقة", color: "bg-blue-100 text-blue-700 border-blue-300", icon: CheckCircle2 },
    CONFIRMED: { label: "مؤكد", color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle2 },
    COMPLETED: { label: "مكتمل", color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle2 },
    CANCELLED: { label: "ملغي", color: "bg-red-100 text-red-700 border-red-300", icon: XCircle },
    REJECTED: { label: "مرفوض", color: "bg-red-100 text-red-700 border-red-300", icon: XCircle },
  }

  const status = statusConfig[booking.status] || statusConfig.PENDING_APPROVAL
  const StatusIcon = status.icon
  const paymentStatus = remainingAmount === 0 && depositAmount > 0 ? { label: "مدفوع بالكامل", color: "bg-green-100 text-green-700" } : depositAmount > 0 ? { label: "مدفوع جزئياً", color: "bg-blue-100 text-blue-700" } : { label: "غير مدفوع", color: "bg-yellow-100 text-yellow-700" }

  const clientName = booking.clientName || "غير محدد"
  const timeSlotLabels: any = { MORNING: "صباحاً", AFTERNOON: "ظهراً", EVENING: "مساءً", NIGHT: "ليلاً" }
  const timeSlotLabel = timeSlotLabels[booking.timeSlot] || booking.timeSlot || "غير محدد"

  return (
    <div suppressHydrationWarning className="min-h-screen bg-gray-50 p-4 lg:p-8 pt-20 lg:pt-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/bookings" className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-800 font-semibold mb-4 transition">
            <ArrowLeft size={20} /> العودة للحجوزات
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">تفاصيل الحجز</h1>
              <p className="text-gray-500">رقم الحجز: <span className="font-mono font-bold text-purple-700">{booking.id.slice(0, 8).toUpperCase()}</span></p>
            </div>
            <div className={`${status.color} border-2 px-6 py-3 rounded-xl font-bold flex items-center gap-2`}>
              <StatusIcon size={24} /> <span className="text-lg">{status.label}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-3">
            <Link href={`/booking/${booking.id}/invoice/print`} target="_blank" className="flex items-center gap-2 px-6 py-3 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition shadow-lg">
              <FileText size={20} /> عرض الفاتورة
            </Link>
            {booking.status === "PENDING_APPROVAL" && isAdmin && (
              <>
                <Link href={`/admin/bookings/${booking.id}/approve`} onClick={(e) => { if (!confirm("هل أنت متأكد؟")) e.preventDefault() }} className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg">موافقة</Link>
                <Link href={`/admin/bookings/${booking.id}/reject`} onClick={(e) => { if (!confirm("هل أنت متأكد؟")) e.preventDefault() }} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg">رفض</Link>
              </>
            )}
            {booking.status === "APPROVED" && remainingAmount > 0 && isAdmin && (
              <Link href={`/admin/bookings/${booking.id}/confirm-payment`} onClick={(e) => { if (!confirm("تأكيد الدفع؟")) e.preventDefault() }} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg">تأكيد الدفع</Link>
            )}
            {booking.status === "APPROVED" && isAdmin && (
              <Link href={`/admin/bookings/${booking.id}/complete`} onClick={(e) => { if (!confirm("تحديد كمكتمل؟")) e.preventDefault() }} className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-lg">تحديد كمكتمل</Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white"><User size={24} /></div>
              <div><h3 className="font-bold text-gray-900 text-lg">بيانات العميل</h3></div>
            </div>
            <div className="space-y-3">
              <div><p className="text-xs text-gray-500 font-semibold mb-1">الاسم</p><p className="font-bold text-gray-900">{clientName}</p></div>
              {booking.clientEmail && <div className="flex items-center gap-2"><Mail size={16} className="text-gray-400" /><p className="text-sm text-gray-700 truncate">{booking.clientEmail}</p></div>}
              {booking.clientPhone && <div className="flex items-center gap-2"><Phone size={16} className="text-gray-400" /><p className="text-sm text-gray-700" dir="ltr">{booking.clientPhone}</p></div>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white"><Music size={24} /></div>
              <div><h3 className="font-bold text-gray-900 text-lg">الفنان</h3></div>
            </div>
            {booking.artist ? (
              <div className="flex items-center gap-4">
                {booking.artist.profileImage ? <img src={booking.artist.profileImage} alt={booking.artist.name} className="w-16 h-16 rounded-xl object-cover" /> : <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-2xl">{booking.artist.name?.charAt(0) || "ف"}</div>}
                <div>
                  {booking.artist.slug ? <Link href={`/admin/artists/${booking.artist.slug}`} className="font-bold text-gray-900 text-lg hover:text-purple-700 transition block">{booking.artist.name}</Link> : <span className="font-bold text-gray-900 text-lg block">{booking.artist.name}</span>}
                  <p className="text-sm text-purple-700">{booking.artist.category || "غير محدد"}</p>
                </div>
              </div>
            ) : <p className="text-gray-500 italic">لا توجد معلومات</p>}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white"><MapPin size={24} /></div>
              <div><h3 className="font-bold text-gray-900 text-lg">مكان الفعالية</h3></div>
            </div>
            {booking.venue ? (
              <div className="space-y-3">
                <div><p className="text-xs text-gray-500 font-semibold mb-1">اسم المكان</p><p className="font-bold text-gray-900">{booking.venue.name}</p></div>
                {booking.venue.address && <div><p className="text-xs text-gray-500 font-semibold mb-1">العنوان</p><p className="text-sm text-gray-700">{booking.venue.address}</p></div>}
              </div>
            ) : <p className="text-gray-500 italic">لا توجد معلومات</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 text-xl mb-6 pb-4 border-b border-gray-200 flex items-center gap-2"><Calendar size={24} className="text-purple-700" /> تفاصيل الحجز</h3>
            <div className="space-y-4">
              {/* ✅ suppressHydrationWarning مضاف هنا كخط دفاع أخير */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">تاريخ الفعالية:</span>
                <span suppressHydrationWarning className="font-bold text-gray-900">{safeFormatDate(booking.date)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">وقت الحجز:</span>
                <span className="font-bold text-gray-900">{timeSlotLabel}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">تاريخ الإنشاء:</span>
                <span suppressHydrationWarning className="font-bold text-gray-900 text-sm">{safeFormatDate(booking.createdAt, true)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">حالة الدفع:</span>
                <span className={`${paymentStatus.color} px-3 py-1 rounded-lg text-sm font-bold`}>{paymentStatus.label}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 text-xl mb-6 pb-4 border-b border-gray-200 flex items-center gap-2"><DollarSign size={24} className="text-purple-700" /> الملخص المالي</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100"><span className="text-gray-600 font-medium">المبلغ الإجمالي:</span><span className="font-bold text-gray-900 text-lg">{grossAmount.toLocaleString("en-US")} ج.م</span></div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100"><span className="text-gray-600 font-medium">العربون المدفوع:</span><span className="font-bold text-green-600 text-lg">{depositAmount.toLocaleString("en-US")} ج.م</span></div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100"><span className="text-gray-600 font-medium">المبلغ المتبقي:</span><span className={`font-bold text-lg ${remainingAmount > 0 ? "text-red-600" : "text-green-600"}`}>{remainingAmount.toLocaleString("en-US")} ج.م</span></div>
            </div>
            <div className="bg-gradient-to-l from-purple-700 to-purple-900 text-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center"><span className="font-bold text-lg">الإجمالي النهائي:</span><span className="font-black text-3xl">{(grossAmount + taxAmount).toLocaleString("en-US")} ج.م</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}