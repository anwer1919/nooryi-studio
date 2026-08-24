"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Calendar, MapPin, Phone, Clock, CheckCircle, XCircle, AlertCircle, Music, FileText, Download, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { PDFDownloadLink } from "@react-pdf/renderer"
import BookingInvoice from "@/components/BookingInvoice"
import FluidBackground from "@/components/FluidBackground"

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
  artist: { name: string; profileImage: string | null }
  venue: { name: string; address: string }
}

export default function BookingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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
        console.error(err)
        setError("الحجز غير موجود")
        setLoading(false)
      })
  }, [bookingId])

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
          <Link href="/my-bookings" className="text-yellow-500 hover:text-yellow-400 flex items-center gap-2">
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
    date: new Date(booking.date).toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    artistName: booking.artist.name,
    clientName: booking.clientName || "غير محدد",
    clientPhone: booking.clientPhone || "غير محدد",
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
        <header className="border-b border-white/10 py-4 px-4 sticky top-0 bg-black/40 backdrop-blur-xl z-40">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <Link href="/my-bookings" className="flex items-center gap-2 text-white/60 hover:text-white transition">
              <ArrowLeft size={20} /> العودة للحجوزات
            </Link>
            <span className="text-xl font-bold text-yellow-500">تفاصيل الحجز</span>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border mb-8 flex items-center gap-3 ${statusInfo.bg}`}>
            <StatusIcon size={24} className={statusInfo.color} />
            <div>
              <p className={`font-bold ${statusInfo.color}`}>حالة الحجز: {statusInfo.label}</p>
              <p className="text-white/60 text-sm">رقم الحجز: {booking.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          {/* Main Info Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-white/10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                {booking.artist.profileImage ? (
                  <img src={booking.artist.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Music size={28} className="text-white/50" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{booking.artist.name}</h2>
                <p className="text-white/60">حجز حفلة خاصة</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3 text-white/70">
                <Calendar size={18} className="text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="text-white/50 text-xs">التاريخ</p>
                  <p className="font-medium">
                    {new Date(booking.date).toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
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
                <Phone size={18} className="text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="text-white/50 text-xs">رقم الهاتف</p>
                  <p className="font-medium" dir="ltr">{booking.clientPhone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          {booking.grossAmount && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-4">ملخص الدفع</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">إجمالي قيمة الحجز</span>
                  <span className="text-white font-bold text-lg">{booking.grossAmount.toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">العربون المدفوع</span>
                  <span className="text-green-400 font-bold">{booking.depositAmount?.toLocaleString() || 0} ج.م</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                  <span className="text-white/60">المبلغ المتبقي</span>
                  <span className="text-yellow-400 font-bold text-xl">{booking.remainingAmount?.toLocaleString() || 0} ج.م</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <PDFDownloadLink
              document={<BookingInvoice data={invoiceData} />}
              fileName={`فاتورة-حجز-${booking.id.slice(0, 8)}.pdf`}
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl transition border border-white/20"
            >
              {({ loading }) =>
                loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    جاري تحضير الفاتورة...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    تحميل الفاتورة PDF
                  </>
                )
              }
            </PDFDownloadLink>

            {booking.remainingAmount && booking.remainingAmount > 0 && booking.status === "APPROVED" && (
              <Link
                href={`/booking/${booking.id}/payment`}
                className="flex-1 flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-4 rounded-xl transition"
              >
                إكمال الدفع
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}