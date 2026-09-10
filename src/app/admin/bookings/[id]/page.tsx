import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import {
  ArrowLeft, Calendar, MapPin, User, Music, DollarSign,
  CheckCircle2, XCircle, Clock, FileText, Phone, Mail
, Printer} from "lucide-react"
import BookingActions from "./BookingActions"

export const dynamic = "force-dynamic"

const safeFormatDate = (dateInput: any, includeTime = false) => {
  if (!dateInput) return "غير محدد"
  try {
    const date = new Date(dateInput)
    if (isNaN(date.getTime())) return "تاريخ غير صالح"
    return date.toLocaleDateString("ar-EG", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      timeZone: "UTC",
      ...(includeTime ? { hour: "2-digit", minute: "2-digit", timeZone: "UTC" } : {}),
    })
  } catch (e) {
    return "غير محدد"
  }
}

export default async function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
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
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="bg-surface p-12 rounded-2xl shadow-xl text-center max-w-md">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-fg mb-2">الحجز غير موجود</h2>
          <Link href="/admin/bookings" className="inline-block px-6 py-3 bg-gradient-to-r from-[#F5A623] to-[#E8961A] text-[#111] text-fg rounded-xl font-bold hover:shadow-lg transition mt-4">
            العودة للحجوزات
          </Link>
        </div>
      </div>
    )
  }

    // ══ فحص صلاحية مدير الأعمال ══
  if (isManager && booking) {
    const mgrUser = await prisma.user.findUnique({ where: { id: (session.user as any).id }, select: { artistId: true } })
    if (mgrUser?.artistId && booking.artistId !== mgrUser.artistId) redirect("/admin")
  }

  const grossAmount = Number(booking.grossAmount || 0)
  const depositAmount = Number(booking.depositAmount || 0)
  const remainingAmount = Number(booking.remainingAmount || 0)

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
  const clientName = booking.clientName || "غير محدد"
  const timeSlotLabels: any = { MORNING: "صباحاً", AFTERNOON: "ظهراً", EVENING: "مساءً", NIGHT: "ليلاً" }
  const timeSlotLabel = timeSlotLabels[booking.timeSlot] || booking.timeSlot || "غير محدد"

  return (
    <div className="min-h-screen bg-bg p-4 lg:p-8 pt-20 lg:pt-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/bookings" className="inline-flex items-center gap-2 text-[#F5A623] hover:text-[#E8961A] font-semibold mb-4 transition">
            <ArrowLeft size={20} /> العودة للحجوزات
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-fg mb-2">تفاصيل الحجز</h1>
              <p className="text-muted">رقم الحجز: <span className="font-mono font-bold text-[#F5A623]">{booking.id.slice(0, 8).toUpperCase()}</span></p>
            </div>
            <div className={`${status.color} border-2 px-6 py-3 rounded-xl font-bold flex items-center gap-2`}>
              <StatusIcon size={24} /> <span className="text-lg">{status.label}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-[#F5A623]/20 mb-6">
          <Link href={`/invoice/print?id=${booking.id}`} target="_blank" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F5A623] to-[#E8961A] text-[#111] text-fg rounded-xl font-bold hover:shadow-lg transition shadow-lg">
            <FileText size={20} /> عرض الفاتورة
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-[#F5A623]/20">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#F5A623]/20">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#E8961A] text-[#111] flex items-center justify-center text-fg">
                <User size={24} />
              </div>
              <h3 className="font-bold text-fg text-lg">بيانات العميل</h3>
            </div>
            <div className="space-y-3">
              <div><p className="text-xs text-muted font-semibold mb-1">الاسم</p><p className="font-bold text-fg">{clientName}</p></div>
              {booking.clientEmail && <div className="flex items-center gap-2"><Mail size={16} className="text-muted" /><p className="text-sm text-muted">{booking.clientEmail}</p></div>}
              {booking.clientPhone && <div className="flex items-center gap-2"><Phone size={16} className="text-muted" /><p className="text-sm text-muted" dir="ltr">{booking.clientPhone}</p></div>}
            </div>
          </div>

          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-[#F5A623]/20">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#F5A623]/20">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-fg">
                <Music size={24} />
              </div>
              <h3 className="font-bold text-fg text-lg">الفنان</h3>
            </div>
            {booking.artist ? (
              <div className="flex items-center gap-4">
                {booking.artist.profileImage ? (
                  <img src={booking.artist.profileImage} alt={booking.artist.name} className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#E8961A] text-[#111] flex items-center justify-center text-fg font-bold text-2xl">
                    {booking.artist.name?.charAt(0) || "ف"}
                  </div>
                )}
                <div>
                  <span className="font-bold text-fg text-lg block">{booking.artist.name}</span>
                  <p className="text-sm text-[#F5A623]">{booking.artist.category || "غير محدد"}</p>
                </div>
              </div>
            ) : <p className="text-muted italic">لا توجد معلومات</p>}
          </div>

          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-[#F5A623]/20">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#F5A623]/20">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-fg">
                <MapPin size={24} />
              </div>
              <h3 className="font-bold text-fg text-lg">مكان الفعالية</h3>
            </div>
            {booking.venue ? (
              <div className="space-y-3">
                <div><p className="text-xs text-muted font-semibold mb-1">اسم المكان</p><p className="font-bold text-fg">{booking.venue.name}</p></div>
                {booking.venue.address && <div><p className="text-xs text-muted font-semibold mb-1">العنوان</p><p className="text-sm text-muted">{booking.venue.address}</p></div>}
              </div>
            ) : <p className="text-muted italic">لا توجد معلومات</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-[#F5A623]/20">
            <h3 className="font-bold text-fg text-xl mb-6 pb-4 border-b border-[#F5A623]/20 flex items-center gap-2">
              <Calendar size={24} className="text-[#F5A623]" /> تفاصيل الحجز
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#F5A623]/10">
                <span className="text-muted font-medium">تاريخ الفعالية:</span>
                <span className="font-bold text-fg">{safeFormatDate(booking.date)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#F5A623]/10">
                <span className="text-muted font-medium">وقت الحجز:</span>
                <span className="font-bold text-fg">{timeSlotLabel}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#F5A623]/10">
                <span className="text-muted font-medium">تاريخ الإنشاء:</span>
                <span className="font-bold text-fg text-sm">{safeFormatDate(booking.createdAt, true)}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-2xl shadow-sm border border-[#F5A623]/20">
            <h3 className="font-bold text-fg text-xl mb-6 pb-4 border-b border-[#F5A623]/20 flex items-center gap-2">
              <DollarSign size={24} className="text-[#F5A623]" /> الملخص المالي
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center pb-3 border-b border-[#F5A623]/10">
                <span className="text-muted font-medium">المبلغ الإجمالي:</span>
                <span className="font-bold text-fg text-lg">{grossAmount.toLocaleString("en-US")} ج.م</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#F5A623]/10">
                <span className="text-muted font-medium">العربون المدفوع:</span>
                <span className="font-bold text-green-600 text-lg">{depositAmount.toLocaleString("en-US")} ج.م</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#F5A623]/10">
                <span className="text-muted font-medium">المبلغ المتبقي:</span>
                <span className={`font-bold text-lg ${remainingAmount > 0 ? "text-red-600" : "text-green-600"}`}>
                  {remainingAmount.toLocaleString("en-US")} ج.م
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-l from-[#F5A623] to-[#E8961A] text-fg p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">الإجمالي النهائي:</span>
                <span className="font-black text-3xl">{grossAmount.toLocaleString("en-US")} ج.م</span>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* ═══════════ أزرار الإجراءات ═══════════ */}
        <div className="mt-6">
          <BookingActions
            bookingId={booking.id}
            status={booking.status}
            artistName={booking.artist?.name || "غير محدد"}
            clientName={clientName}
            clientPhone={booking.clientPhone || ""}
            clientEmail={booking.clientEmail || ""}
            depositAmount={depositAmount}
            totalAmount={grossAmount}
            date={booking.date ? new Date(booking.date).toLocaleDateString("ar-EG") : ""}
            timeSlot={timeSlotLabel}
            venue={booking.venue?.name || "غير محدد"}
          />
        </div>
    </div>
  )
}