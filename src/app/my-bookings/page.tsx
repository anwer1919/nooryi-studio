"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Music,
  FileText,
  Printer,
  Loader2,
  AlertTriangle,
} from "lucide-react"

export const dynamic = "force-dynamic"

type Booking = {
  id: string
  clientName?: string | null
  clientEmail?: string | null
  clientPhone?: string | null
  date?: string | null
  timeSlot?: string | null
  status?: string | null
  grossAmount?: number
  depositAmount?: number
  remainingAmount?: number
  region?: string | null
  createdAt?: string | null
  artist?: {
    id?: string
    name?: string | null
    slug?: string | null
    category?: string | null
    profileImage?: string | null
  } | null
  venue?: {
    id?: string
    name?: string | null
    city?: string | null
  } | null
  payments?: {
    id: string
    amount: number
    status: string
    createdAt: string
  }[]
}

function getStatus(status?: string | null) {
  const s = (status || "").toUpperCase()

  if (["CONFIRMED", "APPROVED", "ACCEPTED"].includes(s)) {
    return { label: "مؤكد", className: "bg-green-100 text-green-800 border-green-200", icon: "✓" }
  }

  if (["PENDING_APPROVAL", "PENDING"].includes(s)) {
    return { label: "قيد المراجعة", className: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: "⏳" }
  }

  if (["COMPLETED", "DONE"].includes(s)) {
    return { label: "مكتمل", className: "bg-blue-100 text-blue-800 border-blue-200", icon: "✓" }
  }

  if (["CANCELLED", "REJECTED"].includes(s)) {
    return { label: "ملغي", className: "bg-red-100 text-red-800 border-red-200", icon: "✕" }
  }

  return { label: status || "غير محدد", className: "bg-gray-100 text-gray-700 border-gray-200", icon: "•" }
}

function formatDate(date?: string | null) {
  if (!date) return "—"
  try {
    return new Date(date).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return "—"
  }
}

function formatMoney(value?: number) {
  return Number(value || 0).toLocaleString("ar-EG") + " ج.م"
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [debug, setDebug] = useState<any>(null)
  const [isNewBooking, setIsNewBooking] = useState(false)
  const [newBookingId, setNewBookingId] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setIsNewBooking(params.get("new") === "true" || params.get("success") === "true")
    setNewBookingId(params.get("id"))

    async function loadBookings() {
      try {
        setLoading(true)
        setError("")

        const res = await fetch("/api/my-bookings", {
          cache: "no-store",
          credentials: "include",
        })

        const data = await res.json()

        if (res.status === 401) {
          window.location.href = "/login?callbackUrl=/my-bookings"
          return
        }

        if (!res.ok || !data.ok) {
          throw new Error(data.error || "فشل تحميل الحجوزات")
        }

        setBookings(data.bookings || [])
        setDebug(data.debug || null)
      } catch (e: any) {
        setError(e?.message || "حدث خطأ أثناء تحميل الحجوزات")
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [])

  return (
    <div className="min-h-screen bg-white pt-20" dir="rtl">
      <main className="pb-20 px-4 lg:px-8 max-w-6xl mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#b8941f] font-bold text-sm mb-3">
            حسابي
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
            حجوزاتي <span className="text-[#b8941f]">الخاصة</span>
          </h1>

          {isNewBooking && (
            <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-2xl">✓</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-green-900">تم إرسال حجزك بنجاح 🎉</h3>
                  <p className="text-sm text-green-800">يمكنك متابعة حالة الحجز من هنا.</p>
                  {newBookingId && (
                    <p className="text-xs font-mono bg-green-100 inline-block px-3 py-1 rounded mt-2" dir="ltr">
                      {newBookingId}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <p className="text-gray-500">
            إدارة ومتابعة جميع حجوزاتك — {loading ? "..." : bookings.length} حجز
          </p>
        </div>

        {loading && (
          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm text-center py-20">
            <Loader2 className="mx-auto text-[#b8941f] mb-4 animate-spin" size={56} />
            <h3 className="text-xl font-black text-gray-900">جاري تحميل حجوزاتك...</h3>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 text-center py-16 px-6">
            <AlertTriangle className="mx-auto text-red-500 mb-4" size={56} />
            <h3 className="text-2xl font-black text-red-900 mb-2">حدث خطأ</h3>
            <p className="text-red-700 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm text-center py-20 px-6">
            <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-2xl font-black text-gray-900 mb-2">لا توجد حجوزات بعد</h3>
            <p className="text-gray-500 mb-6">ابدأ رحلتك بحجز فنانك المفضل</p>

            {debug && (
              <div className="max-w-2xl mx-auto mb-6 text-left bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs font-mono" dir="ltr">
                <p>DEBUG userId: {debug.userId || "EMPTY"}</p>
                <p>DEBUG userEmail: {debug.userEmail || "EMPTY"}</p>
                <p>DEBUG customerIds: {(debug.customerIds || []).join(", ") || "EMPTY"}</p>
                <p>DEBUG conditionsCount: {debug.conditionsCount || 0}</p>
              </div>
            )}

            <Link
              href="/artists"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D4AF37] text-[#111] font-black"
            >
              <Music size={18} /> تصفح الفنانين
            </Link>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {bookings.map((b) => {
              const s = getStatus(b.status)

              return (
                <div key={b.id} className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="relative h-48 bg-gradient-to-br from-[#111] to-[#232323] overflow-hidden">
                    {b.artist?.profileImage ? (
                      <img
                        src={b.artist.profileImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music size={48} className="text-[#d4af37]/50" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                    <div className="absolute top-4 right-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-black ${s.className}`}>
                        {s.icon} {s.label}
                      </span>
                    </div>

                    <div className="absolute bottom-4 right-4 left-4">
                      <p className="text-[#d4af37] text-xs font-bold mb-1">
                        {b.artist?.category || "فنان"}
                      </p>
                      <h3 className="text-2xl font-black text-white">
                        {b.artist?.name || "فنان"}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <Calendar size={16} className="text-[#b8941f] mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">التاريخ</p>
                          <p className="text-sm font-bold">{formatDate(b.date)}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Clock size={16} className="text-[#b8941f] mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">الوقت</p>
                          <p className="text-sm font-bold">{b.timeSlot || "—"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-[#b8941f] mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">المكان</p>
                        <p className="text-sm font-bold">
                          {b.venue?.name || b.region || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <DollarSign size={16} className="text-[#b8941f] mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">المبلغ</p>
                        <p className="text-lg font-black">{formatMoney(b.grossAmount)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-[#e8e4d9]">
                      <Link
                        href={`/invoice?id=${b.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#111] font-black text-sm"
                      >
                        <FileText size={14} /> عرض الفاتورة
                      </Link>

                      <Link
                        href={`/invoice/print?id=${b.id}`}
                        target="_blank"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#D4AF37] text-[#111] font-black text-sm"
                      >
                        <Printer size={14} /> طباعة
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}