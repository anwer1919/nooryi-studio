"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react"

interface BookingFormProps {
  artistId: string
  artistName: string
  venues: { id: string; name: string; address: string }[]
  userEmail: string
  userName: string
  userPhone?: string
}

export default function BookingForm({ 
  artistId, 
  artistName, 
  venues, 
  userEmail,
  userName,
  userPhone
}: BookingFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    clientName: userName || "",
    clientPhone: userPhone || "",
    clientEmail: userEmail || "",
    venueId: venues[0]?.id || "",
    date: "",
    timeSlot: "EVENING",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!userEmail) {
      setError("يجب تسجيل الدخول أولاً")
      setLoading(false)
      router.push(`/login?callbackUrl=/artists/${artistId}`)
      return
    }

    if (!formData.clientName || !formData.clientPhone || !formData.date || !formData.venueId) {
      setError("يرجى ملء جميع الحقول المطلوبة")
      setLoading(false)
      return
    }

    try {
      const requestData = {
        artistId,
        venueId: formData.venueId,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientEmail: formData.clientEmail,
        date: formData.date,
        timeSlot: formData.timeSlot,
        grossAmount: 5000,
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `خطأ ${response.status}`)
      }

      setSuccess(true)
      
      setTimeout(() => {
        router.push(`/booking/${data.booking.id}`)
      }, 3000)
    } catch (err: any) {
      console.error("❌ خطأ في الحجز:", err)
      setError(err.message || "حدث خطأ في الحجز")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
          <CheckCircle2 className="text-green-400" size={32} />
        </div>
        <h3 className="text-xl font-bold mb-2 text-green-400">تم إرسال الحجز بنجاح!</h3>
        <p className="text-sm text-white/60 mb-4">
          سيتم مراجعة طلبك من قبل الإدارة وإعلامك بالموافقة
        </p>
        <p className="text-xs text-white/40">
          جاري تحويلك لصفحة تفاصيل الحجز...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" id="booking-form">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
            <p className="text-sm text-red-400 font-semibold">{error}</p>
          </div>
        </div>
      )}

      {!userEmail && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center">
          <p className="text-sm text-yellow-400 mb-2">يجب تسجيل الدخول أولاً</p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-xs text-yellow-400 underline"
          >
            تسجيل الدخول
          </button>
        </div>
      )}

      {/* Client Name */}
      <div>
        <label 
          htmlFor="clientName" 
          className="block text-sm text-white/60 mb-1.5"
        >
          الاسم الكامل *
        </label>
        <div className="relative">
          <User className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <input
            id="clientName"
            name="clientName"
            type="text"
            autoComplete="name"
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            placeholder="أدخل اسمك"
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:border-yellow-500/50"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label 
          htmlFor="clientPhone" 
          className="block text-sm text-white/60 mb-1.5"
        >
          رقم الهاتف *
        </label>
        <div className="relative">
          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <input
            id="clientPhone"
            name="clientPhone"
            type="tel"
            autoComplete="tel"
            value={formData.clientPhone}
            onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
            placeholder="01xxxxxxxxx"
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:border-yellow-500/50"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label 
          htmlFor="clientEmail" 
          className="block text-sm text-white/60 mb-1.5"
        >
          البريد الإلكتروني
        </label>
        <div className="relative">
          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <input
            id="clientEmail"
            name="clientEmail"
            type="email"
            autoComplete="email"
            value={formData.clientEmail}
            onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
            placeholder="example@email.com"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:border-yellow-500/50"
          />
        </div>
      </div>

      {/* Venue */}
      <div>
        <label 
          htmlFor="venueId" 
          className="block text-sm text-white/60 mb-1.5"
        >
          المكان *
        </label>
        <div className="relative">
          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <select
            id="venueId"
            name="venueId"
            value={formData.venueId}
            onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:border-yellow-500/50 appearance-none"
          >
            <option value="">اختر المكان</option>
            {venues.map((venue) => (
              <option key={venue.id} value={venue.id} className="bg-black">
                {venue.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date */}
      <div>
        <label 
          htmlFor="bookingDate" 
          className="block text-sm text-white/60 mb-1.5"
        >
          تاريخ الفعالية *
        </label>
        <div className="relative">
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <input
            id="bookingDate"
            name="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            min={new Date().toISOString().split("T")[0]}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:border-yellow-500/50"
          />
        </div>
      </div>

      {/* Time Slot */}
      <div>
        <label className="block text-sm text-white/60 mb-1.5">الفترة *</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "MORNING", label: "صباحاً" },
            { value: "AFTERNOON", label: "ظهيرة" },
            { value: "EVENING", label: "مساءً" },
            { value: "NIGHT", label: "ليلاً" },
          ].map((slot) => (
            <button
              key={slot.value}
              type="button"
              onClick={() => setFormData({ ...formData, timeSlot: slot.value })}
              className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                formData.timeSlot === slot.value
                  ? "bg-yellow-500 text-black"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
            >
              {slot.label}
            </button>
          ))}
        </div>
        {/* Hidden input for timeSlot */}
        <input type="hidden" name="timeSlot" value={formData.timeSlot} />
      </div>

      {/* Price Info */}
      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
        <p className="text-xs text-white/60 mb-1">السعر التقديري</p>
        <p className="text-2xl font-black text-yellow-400">5,000 ج.م</p>
        <p className="text-xs text-white/40 mt-1">العربون: 1,000 ج.م (20%)</p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !userEmail}
        className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold py-3.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            جاري الإرسال...
          </>
        ) : (
          <>
            <CheckCircle2 size={18} />
            تأكيد الحجز
          </>
        )}
      </button>
    </form>
  )
}