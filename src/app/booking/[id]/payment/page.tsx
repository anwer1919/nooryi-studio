"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Calendar, MapPin, Phone, Clock, CheckCircle, Music, Loader2, AlertCircle, CreditCard, ArrowLeft } from "lucide-react"
import Link from "next/link"
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
  artist?: { 
    name: string
    slug?: string
    profileImage: string | null
    category?: string | null
  }
  venue?: { 
    name: string
    address: string | null
  }
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [processing, setProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  useEffect(() => {
    fetch(`/api/bookings/${bookingId}`)
      .then(async res => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.error || "Booking not found")
        }
        return res.json()
      })
      .then(data => {
        console.log("✅ Booking loaded:", data)
        setBooking(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("❌ Load error:", err.message)
        setError(err.message)
        setLoading(false)
      })
  }, [bookingId])

  const getTimeSlotLabel = (slot: string) => {
    const labels: Record<string, string> = {
      MORNING: "صباحاً (9ص - 12ظ)",
      AFTERNOON: "ظهراً (12ظ - 5م)",
      EVENING: "مساءً (5م - 11م)",
    }
    return labels[slot] || slot
  }

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      alert("الرجاء اختيار طريقة الدفع")
      return
    }

    setProcessing(true)

    // محاكاة عملية الدفع
    await new Promise(resolve => setTimeout(resolve, 2000))

    setProcessing(false)
    setPaymentSuccess(true)

    // تحويل لصفحة الحجوزات بعد 3 ثواني
    setTimeout(() => {
      router.push("/my-bookings")
    }, 3000)
  }

  const paymentMethods = [
    {
      id: "visa",
      name: "بطاقة ائتمان (فيزا / ماستركارد)",
      icon: "💳",
      description: "دفع آمن ومشفر",
    },
    {
      id: "vodafone_cash",
      name: "فودافون كاش",
      icon: "📱",
      description: "ادفع من محفظتك الإلكترونية",
    },
    {
      id: "instapay",
      name: "إنستا باي",
      icon: "⚡",
      description: "تحويل فوري من حسابك البنكي",
    },
    {
      id: "bank_transfer",
      name: "تحويل بنكي",
      icon: "🏦",
      description: "تحويل مباشر للحساب البنكي",
    },
  ]

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
          <p className="text-xl text-red-400 mb-4">{error || "الحجز غير موجود"}</p>
          <Link href="/my-bookings" className="text-yellow-500 hover:text-yellow-400 flex items-center gap-2">
            <ArrowLeft size={20} /> العودة للحجوزات
          </Link>
        </div>
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <div className="relative min-h-screen bg-[#1a0a04]">
        <FluidBackground scrimStrength="strong" />
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-400" size={48} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">تم الدفع بنجاح!</h1>
            <p className="text-white/60 mb-8">
              شكراً لك! تم استلام العربون بنجاح. سيتم تأكيد حجزك قريباً.
            </p>
            <p className="text-white/40 text-sm">
              جاري تحويلك لصفحة حجوزاتي...
            </p>
          </div>
        </div>
      </div>
    )
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
            <span className="text-xl font-bold text-yellow-500">إتمام الدفع</span>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Status Banner */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8 flex items-center gap-3">
            <Clock size={24} className="text-yellow-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-yellow-400">الحجز بانتظار الدفع</p>
              <p className="text-white/60 text-sm">
                رقم الحجز: {booking.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Music size={20} className="text-yellow-500" />
              تفاصيل الحجز
            </h2>

            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-white/10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                {booking.artist?.profileImage ? (
                  <img src={booking.artist.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Music size={28} className="text-white/50" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {booking.artist?.name || "فنان"}
                </h3>
                <p className="text-white/60 text-sm">
                  {booking.artist?.category || "فنان محترف"}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3 text-white/70">
                <Calendar size={18} className="text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="text-white/50 text-xs">التاريخ</p>
                  <p className="font-medium">
                    {new Date(booking.date).toLocaleDateString("ar-EG", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
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
              {booking.venue && (
                <div className="flex items-center gap-3 text-white/70">
                  <MapPin size={18} className="text-yellow-500 flex-shrink-0" />
                  <div>
                    <p className="text-white/50 text-xs">المكان</p>
                    <p className="font-medium">{booking.venue.name}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 text-white/70">
                <Phone size={18} className="text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="text-white/50 text-xs">رقم الهاتف</p>
                  <p className="font-medium" dir="ltr">
                    {booking.clientPhone || "غير محدد"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          {booking.grossAmount && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-yellow-500" />
                ملخص الدفع
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">إجمالي قيمة الحجز</span>
                  <span className="text-white font-bold text-lg">
                    {booking.grossAmount.toLocaleString()} ج.م
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                  <span className="text-yellow-400 font-bold">العربون المطلوب الآن</span>
                  <span className="text-yellow-400 font-bold text-2xl">
                    {booking.depositAmount?.toLocaleString() || 0} ج.م
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">المتبقي (يُدفع قبل الحفل بـ 48 ساعة)</span>
                  <span className="text-white/60">
                    {booking.remainingAmount?.toLocaleString() || 0} ج.م
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Methods */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">اختر طريقة الدفع</h2>
            <div className="space-y-3">
              {paymentMethods.map(method => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition ${
                    selectedPaymentMethod === method.id
                      ? "bg-yellow-500/10 border-yellow-500/50"
                      : "bg-black/40 border-white/10 hover:border-white/20"
                  }`}
                >
                  <span className="text-3xl">{method.icon}</span>
                  <div className="flex-1 text-right">
                    <p className="font-bold text-white">{method.name}</p>
                    <p className="text-white/60 text-sm">{method.description}</p>
                  </div>
                  {selectedPaymentMethod === method.id && (
                    <CheckCircle size={24} className="text-yellow-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={processing || !selectedPaymentMethod}
            className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                جاري معالجة الدفع...
              </>
            ) : (
              <>
                <CreditCard size={20} />
                ادفع {booking.depositAmount?.toLocaleString() || 0} ج.م الآن
              </>
            )}
          </button>

          {/* Security Note */}
          <div className="mt-6 text-center text-white/40 text-sm">
            🔒 جميع المعاملات مشفرة وآمنة بتقنية SSL 256-bit
          </div>
        </div>
      </div>
    </div>
  )
}