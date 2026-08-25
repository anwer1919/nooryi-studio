"use client"

`nexport const dynamic = "force-dynamic"`nimport { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Calendar, MapPin, Phone, Search, Clock, CheckCircle, XCircle, AlertCircle, Music, CreditCard, Loader2, Star, FileText } from "lucide-react"
import Link from "next/link"
import ReviewForm from "@/components/ReviewForm"
import FluidBackground from "@/components/FluidBackground"

interface Booking {
  id: string
  clientName: string | null
  clientPhone: string | null
  date: string
  timeSlot: string
  status: string
  createdAt: string
  grossAmount: number | null
  depositAmount: number | null
  remainingAmount: number | null
  artist: {
    name: string
    slug: string
    profileImage: string | null
    category: string | null
  }
  venue: {
    name: string
    address: string
  }
  review?: {
    id: string
    rating: number
  } | null
}

export default function MyBookingsPage() {
  const sessionObj = useSession()`n  const session = sessionObj?.data || null`n  const status = sessionObj?.status || "loading"
  const [phone, setPhone] = useState("")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (status === "authenticated") {
      fetchBookings()
    }
  }, [status, refreshKey])

  const fetchBookings = async (phoneSearch?: string) => {
    setLoading(true)
    setError("")

    try {
      const url = phoneSearch
        ? `/api/my-bookings?phone=${encodeURIComponent(phoneSearch)}`
        : "/api/my-bookings"

      const res = await fetch(url)
      const data = await res.json()

      if (res.ok) {
        setBookings(Array.isArray(data) ? data : [])
        setSearched(true)
      } else {
        setError(data.error || "حدث خطأ")
        setBookings([])
      }
    } catch (err) {
      setError("حدث خطأ أثناء البحث")
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) {
      setError("الرجاء إدخال رقم الهاتف")
      return
    }
    await fetchBookings(phone)
  }

  const handleReviewSuccess = () => {
    setRefreshKey(prev => prev + 1)
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

  if (status === "loading") {
    return (
      <div className="relative min-h-screen bg-[#1a0a04]">
        <FluidBackground scrimStrength="strong" />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto animate-spin text-yellow-500 mb-4" size={40} />
            <p className="text-white/60">جاري التحميل...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#1a0a04]">
      {/* خلفية السائل */}
      <FluidBackground scrimStrength="strong" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 py-4 px-4 sticky top-0 bg-black/40 backdrop-blur-xl z-40">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-yellow-500 to-amber-700 rounded-lg flex items-center justify-center">
                <Music size={18} className="text-black" />
              </div>
              <span className="text-xl font-bold text-yellow-500">Nooryi Studio</span>
            </Link>
            <Link
              href="/artists"
              className="text-white/60 hover:text-white transition text-sm flex items-center gap-2"
            >
              <Music size={16} />
              تصفح الفنانين
            </Link>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-white">حجوزاتي</h1>
            {session?.user ? (
              <div>
                <p className="text-white/60 text-lg mb-2">
                  مرحباً <span className="text-yellow-500 font-bold">{session.user.name || session.user.email}</span>
                </p>
                <p className="text-yellow-500 text-sm flex items-center justify-center gap-2">
                  🔒 هذه حجوزاتك الشخصية فقط - لا يمكن لأي شخص آخر رؤيتها
                </p>
              </div>
            ) : (
              <p className="text-white/60 text-lg">
                أدخل رقم الهاتف الذي استخدمته عند الحجز
              </p>
            )}
          </div>

          {/* نموذج البحث - يظهر فقط للغير مسجلين */}
          {!session?.user && (
            <div className="bg-white/8 backdrop-blur-xl border border-white/16 rounded-2xl p-6 mb-12">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="أدخل رقم الهاتف"
                    className="w-full pr-12 pl-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-yellow-500 outline-none transition"
                    dir="ltr"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-8 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                  {loading ? "جاري البحث..." : "بحث"}
                </button>
              </form>

              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-white/10 text-center">
                <p className="text-white/50 text-sm mb-3">
                  لديك حساب بالفعل؟
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-400 font-bold transition"
                >
                  سجّل الدخول لعرض حجوزاتك تلقائياً
                </Link>
              </div>
            </div>
          )}

          {/* عرض الحجوزات */}
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="mx-auto animate-spin text-yellow-500 mb-4" size={40} />
              <p className="text-white/50">جاري التحميل...</p>
            </div>
          ) : searched && bookings.length === 0 ? (
            <div className="bg-white/8 backdrop-blur-xl border border-white/16 rounded-2xl p-12 text-center">
              <Calendar className="mx-auto text-white/30 mb-4" size={64} />
              <p className="text-white/60 text-lg mb-2">لا توجد حجوزات</p>
              <p className="text-white/40 text-sm mb-6">
                {session?.user
                  ? "لم تقم بأي حجوزات بعد. ابدأ بحجز حفلتك الآن!"
                  : "تأكد من إدخال الرقم الصحيح الذي استخدمته عند الحجز"}
              </p>
              <Link
                href="/artists"
                className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-6 rounded-lg transition"
              >
                <Music size={20} />
                تصفح الفنانين واحجز الآن
              </Link>
            </div>
          ) : (
            <>
              {bookings.length > 0 && (
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    حجوزاتك ({bookings.length})
                  </h2>
                </div>
              )}

              <div className="grid gap-6">
                {bookings.map((booking) => {
                  const statusInfo = getStatusInfo(booking.status)
                  const StatusIcon = statusInfo.icon
                  const needsPayment = booking.status === "APPROVED" && booking.remainingAmount && booking.remainingAmount > 0
                  const canReview = (booking.status === "APPROVED" || booking.status === "COMPLETED") && !booking.review

                  return (
                    <div
                      key={booking.id}
                      className="bg-white/8 backdrop-blur-xl border border-white/16 rounded-2xl p-6 hover:border-yellow-500/30 transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-16 h-16 bg-white/10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                              {booking.artist.profileImage ? (
                                <img src={booking.artist.profileImage} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Music size={28} className="text-white/50" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 flex-wrap mb-1">
                                <h3 className="font-bold text-white text-xl">{booking.artist.name}</h3>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.bg} ${statusInfo.color}`}>
                                  <StatusIcon size={12} />
                                  {statusInfo.label}
                                </span>
                              </div>
                              <p className="text-sm text-white/60">{booking.artist.category || "فنان"}</p>
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-white/70">
                              <Calendar size={16} className="text-yellow-500 flex-shrink-0" />
                              {new Date(booking.date).toLocaleDateString("ar-EG", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              })}
                            </div>
                            <div className="flex items-center gap-2 text-white/70">
                              <Clock size={16} className="text-yellow-500 flex-shrink-0" />
                              {getTimeSlotLabel(booking.timeSlot)}
                            </div>
                            <div className="flex items-center gap-2 text-white/70">
                              <MapPin size={16} className="text-yellow-500 flex-shrink-0" />
                              {booking.venue.name}
                            </div>
                            <div className="flex items-center gap-2 text-white/70">
                              <Phone size={16} className="text-yellow-500 flex-shrink-0" />
                              <span dir="ltr">{booking.clientPhone}</span>
                            </div>
                          </div>

                          {/* معلومات مالية */}
                          {booking.grossAmount && (
                            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-3">
                              <div>
                                <p className="text-xs text-white/50 mb-1">الإجمالي</p>
                                <p className="text-white font-bold">{booking.grossAmount.toLocaleString()} ج.م</p>
                              </div>
                              <div>
                                <p className="text-xs text-white/50 mb-1">المدفوع</p>
                                <p className="text-green-400 font-bold">{(booking.depositAmount || 0).toLocaleString()} ج.م</p>
                              </div>
                              <div>
                                <p className="text-xs text-white/50 mb-1">المتبقي</p>
                                <p className="text-yellow-400 font-bold">{(booking.remainingAmount || 0).toLocaleString()} ج.م</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* رسائل الحالة */}
                      {booking.status === "PENDING_APPROVAL" && (
                        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm flex items-center gap-2">
                          <AlertCircle size={16} className="flex-shrink-0" />
                          طلبك قيد المراجعة، سيتم التواصل معك خلال 24 ساعة
                        </div>
                      )}
                      {booking.status === "APPROVED" && (
                        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2">
                          <CheckCircle size={16} className="flex-shrink-0" />
                          تم تأكيد حجزك! سيتواصل معك الفريق قبل الموعد بـ 48 ساعة
                        </div>
                      )}
                      {booking.status === "REJECTED" && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
                          <XCircle size={16} className="flex-shrink-0" />
                          نعتذر، لم نتمكن من تأكيد هذا الحجز. يمكنك تجربة موعد آخر
                        </div>
                      )}
                      {booking.status === "COMPLETED" && (
                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 text-sm flex items-center gap-2">
                          <CheckCircle size={16} className="flex-shrink-0" />
                          تم إتمام الحجز بنجاح. نتمنى أن تكون التجربة كانت رائعة!
                        </div>
                      )}

                      {/* عرض التقييم السابق */}
                      {booking.review && (
                        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm flex items-center gap-2">
                          <Star size={16} className="fill-yellow-400" />
                          لقد قيّمت هذا الحجز بـ {booking.review.rating} نجوم. شكراً لمشاركتك!
                        </div>
                      )}

                      {/* نموذج التقييم */}
                      {canReview && (
                        <div className="mt-4">
                          <ReviewForm
                            bookingId={booking.id}
                            artistName={booking.artist.name}
                            onSuccess={handleReviewSuccess}
                          />
                        </div>
                      )}

                      {/* أزرار الإجراءات */}
                      <div className="mt-6 flex flex-col gap-3">
                        {/* زر تحميل الفاتورة */}
                        <Link
                          href={`/booking/${booking.id}/invoice`}
                          className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg transition border border-white/20"
                        >
                          <FileText size={18} />
                          تحميل الفاتورة
                        </Link>

                        {/* زر الدفع */}
                        {needsPayment && (
                          <Link
                            href={`/booking/${booking.id}/payment`}
                            className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 rounded-lg transition"
                          >
                            <CreditCard size={18} />
                            ادفع المتبقي ({booking.remainingAmount?.toLocaleString()} ج.م)
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* CTA لو مفيش بحث بعد */}
          {!searched && !session?.user && (
            <div className="text-center">
              <Link
                href="/artists"
                className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-4 px-8 rounded-lg transition text-lg"
              >
                <Music size={24} />
                تصفح الفنانين واحجز حفلتك
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}