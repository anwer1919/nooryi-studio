"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Calendar, MapPin, Phone, Clock, CheckCircle, XCircle, AlertCircle, Music, FileText, Download, ArrowLeft, Loader2, Mail, User } from "lucide-react"
import Link from "next/link"
import { PDFDownloadLink } from "@react-pdf/renderer"
import BookingInvoice from "@/components/BookingInvoice"
import FluidBackground from "@/components/LazyFluidBackground"

interface BookingData {
  id: string
  date: string
  timeSlot: string
  status: string
  grossAmount: number | null
  depositAmount: number | null
  remainingAmount: number | null
  clientName: string | null
  clientPhone: string | null
  clientEmail: string | null
  createdAt: string
  artist: { 
    name: string
    slug: string
    profileImage: string | null
  }
  customer?: {
    fullName: string | null
    phone: string | null
  } | null
  venue: { name: string; address: string }
  review?: { id: string; rating: number } | null
}

export default function AdminBookingDetailsPage() {
  const params = useParams()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetch(`/api/bookings/${bookingId}`)
      .then(res => {
        if (!res.ok) throw new Error("Booking not found")
        return res.json()
      })
      .then(data => {
        setBooking(data)
        setLoading(false)
      })
      .catch(err => {
        setError("الحجز غير موجود")
        setLoading(false)
      })
  }, [bookingId])

  const updateStatus = async (newStatus: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setBooking(prev => prev ? { ...prev, status: newStatus } : prev)
      } else {
        alert("فشل تحديث الحالة")
      }
    } catch (err) {
      alert("حدث خطأ")
    } finally {
      setUpdating(false)
    }
  }

  const getStatusInfo = (status: string) => {
    const info: Record<string, { label: string; color: string; icon: any; bg: string }> = {
      PENDING_APPROVAL: { label: "بانتظار الموافقة", color: "text-yellow-400", icon: Clock, bg: "bg-yellow-500/10 border-yellow-500/30" },
      APPROVED: { label: "مؤكد", color: "text-green-400", icon: CheckCircle, bg: "bg-green-500/10 border-green-500/30" },
      REJECTED: { label: "مرفوض", color: "text-red-400", icon: XCircle, bg: "bg-red-500/10 border-red-500/30" },
      CANCELLED: { label: "ملغي", color: "text-white/60", icon: XCircle, bg: "bg-white/10 border-white/20" },
      COMPLETED: { label: "مكتمل", color: "text-blue-400", icon: CheckCircle, bg: "bg-blue-500/10 border-blue-500/30" },
    }
    return info[status] || { label: status, color: "text-white/60", icon: AlertCircle, bg: "bg-white/10 border-white/20" }
  }

  const getTimeSlotLabel = (slot: string) => {
    const labels: Record<string, string> = {
      MORNING: "صباحاً (9ص - 12ظ)",
      AFTERNOON: "ظهراً (12ظ - 5م)",
      EVENING: "مساءً (5م - 11م)",
    }
    return labels[slot] || slot
  }

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#1a0a04]">
        <FluidBackground scrimStrength="strong" />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-yellow-500" size={40} />
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="relative min-h-screen bg-[#1a0a04]">
        <FluidBackground scrimStrength="strong" />
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center">
          <AlertCircle className="text-red-400 mb-4" size={48} />
          <p className="text-xl text-red-400 mb-4">{error}</p>
          <Link href="/admin/bookings" className="text-yellow-500 hover:text-yellow-400 flex items-center gap-2">
            <ArrowLeft size={20} /> العودة للحجوزات
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(booking.status)
  const StatusIcon = statusInfo.icon

  const invoiceData = {
    bookingId: booking.id,
    date: new Date(booking.date).toLocaleDateString("ar-EG", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    }),
    artistName: booking.artist.name,
    clientName: booking.clientName || booking.customer?.fullName || "غير محدد",
    clientPhone: booking.clientPhone || booking.customer?.phone || "غير محدد",
    clientEmail: booking.clientEmail || undefined,
    venueName: booking.venue.name,
    venueAddress: booking.venue.address || undefined,
    timeSlot: booking.timeSlot,
    grossAmount: booking.grossAmount || 0,
    depositAmount: booking.depositAmount || 0,
    remainingAmount: booking.remainingAmount || 0,
    status: booking.status,
    createdAt: new Date(booking.createdAt).toLocaleDateString("ar-EG"),
  }

  return (
    <div className="relative min-h-screen bg-[#1a0a04]">
      <FluidBackground scrimStrength="strong" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin/bookings" className="flex items-center gap-2 text-white/60 hover:text-white transition">
            <ArrowLeft size={20} /> العودة للحجوزات
          </Link>
          <h1 className="text-2xl font-bold text-white">تفاصيل الحجز</h1>
        </div>

        {/* Status Banner */}
        <div className={`p-4 rounded-xl border mb-6 flex items-center justify-between flex-wrap gap-3 ${statusInfo.bg}`}>
          <div className="flex items-center gap-3">
            <StatusIcon size={24} className={statusInfo.color} />
            <div>
              <p className={`font-bold ${statusInfo.color}`}>الحالة: {statusInfo.label}</p>
              <p className="text-white/60 text-sm">رقم الحجز: {booking.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
          
          {/* أزرار تغيير الحالة */}
          <div className="flex flex-wrap gap-2">
            {booking.status === "PENDING_APPROVAL" && (
              <>
                <button
                  onClick={() => updateStatus("APPROVED")}
                  disabled={updating}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition text-sm disabled:opacity-50"
                >
                  ✓ تأكيد
                </button>
                <button
                  onClick={() => updateStatus("REJECTED")}
                  disabled={updating}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition text-sm disabled:opacity-50"
                >
                  ✗ رفض
                </button>
              </>
            )}
            {booking.status === "APPROVED" && (
              <button
                onClick={() => updateStatus("COMPLETED")}
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition text-sm disabled:opacity-50"
              >
                ✓ إتمام الحجز
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* معلومات الحجز */}
          <div className="lg:col-span-2 space-y-6">
            {/* معلومات الفنان */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Music size={20} className="text-yellow-500" />
                معلومات الفنان
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                  {booking.artist.profileImage ? (
                    <img src={booking.artist.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Music size={28} className="text-white/50" />
                  )}
                </div>
                <div>
                  <p className="text-white font-bold text-xl">{booking.artist.name}</p>
                  <Link 
                    href={`/artists/${booking.artist.slug}`} 
                    className="text-yellow-500 hover:text-yellow-400 text-sm"
                    target="_blank"
                  >
                    عرض صفحة الفنان ←
                  </Link>
                </div>
              </div>
            </div>

            {/* تفاصيل الحجز */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-yellow-500" />
                تفاصيل الحجز
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3 text-white/70">
                  <Calendar size={18} className="text-yellow-500 flex-shrink-0" />
                  <div>
                    <p className="text-white/50 text-xs">التاريخ</p>
                    <p className="font-medium">
                      {new Date(booking.date).toLocaleDateString("ar-EG", {
                        weekday: "long", year: "numeric", month: "long", day: "numeric"
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <Clock size={18} className="text-yellow-500 flex-shrink-0" />
                  <div>
                    <p className="text-white/50 text-xs">الفترة</p>
                    <p className="font-medium">{getTimeSlotLabel(booking.timeSlot)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <MapPin size={18} className="text-yellow-500 flex-shrink-0" />
                  <div>
                    <p className="text-white/50 text-xs">المكان</p>
                    <p className="font-medium">{booking.venue.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <Clock size={18} className="text-yellow-500 flex-shrink-0" />
                  <div>
                    <p className="text-white/50 text-xs">تاريخ الحجز</p>
                    <p className="font-medium">{new Date(booking.createdAt).toLocaleDateString("ar-EG")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* معلومات العميل */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User size={20} className="text-yellow-500" />
                معلومات العميل
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-white/70">
                  <User size={18} className="text-yellow-500 flex-shrink-0" />
                  <div>
                    <p className="text-white/50 text-xs">الاسم</p>
                    <p className="font-medium">{booking.clientName || booking.customer?.fullName || "غير محدد"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/70">
                  <Phone size={18} className="text-yellow-500 flex-shrink-0" />
                  <div>
                    <p className="text-white/50 text-xs">الهاتف</p>
                    <p className="font-medium" dir="ltr">{booking.clientPhone || booking.customer?.phone || "غير محدد"}</p>
                  </div>
                </div>
                {booking.clientEmail && (
                  <div className="flex items-center gap-3 text-white/70">
                    <Mail size={18} className="text-yellow-500 flex-shrink-0" />
                    <div>
                      <p className="text-white/50 text-xs">البريد الإلكتروني</p>
                      <p className="font-medium" dir="ltr">{booking.clientEmail}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* الشريط الجانبي */}
          <div className="space-y-6">
            {/* ملخص الدفع */}
            {booking.grossAmount && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">ملخص الدفع</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">الإجمالي</span>
                    <span className="text-white font-bold text-lg">{booking.grossAmount.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">المدفوع</span>
                    <span className="text-green-400 font-bold">{(booking.depositAmount || 0).toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-white/10">
                    <span className="text-white/60">المتبقي</span>
                    <span className="text-yellow-400 font-bold text-xl">{(booking.remainingAmount || 0).toLocaleString()} ج.م</span>
                  </div>
                </div>
              </div>
            )}

            {/* زر تحميل الفاتورة */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileText size={20} className="text-yellow-500" />
                الفاتورة
              </h3>
              <PDFDownloadLink
                document={<BookingInvoice data={invoiceData} />}
                fileName={`فاتورة-حجز-${booking.id.slice(0, 8)}.pdf`}
                className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 rounded-lg transition"
              >
                {({ loading }) =>
                  loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      جاري التحميل...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      تحميل الفاتورة PDF
                    </>
                  )
                }
              </PDFDownloadLink>
              <p className="text-white/40 text-xs text-center mt-3">
                الفاتورة تحتوي على كل تفاصيل الحجز
              </p>
            </div>

            {/* التقييم */}
            {booking.review && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-3">تقييم العميل</h3>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-2xl ${i < booking.review!.rating ? "text-yellow-400" : "text-white/20"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-white/60 text-sm mt-2">
                  {booking.review.rating} من 5 نجوم
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}