"use client"

import { useState, useEffect } from "react"
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
}

export default function BookingForm({ 
  artistId, 
  artistName, 
  venues, 
  userEmail,
  userName,
}: BookingFormProps) {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    venueId: "",
    date: "",
    timeSlot: "EVENING",
  })

  useEffect(() => {
    setIsMounted(true)
    setFormData({
      clientName: userName || "",
      clientPhone: "",
      clientEmail: userEmail || "",
      venueId: venues[0]?.id || "",
      date: "",
      timeSlot: "EVENING",
    })
  }, [userName, userEmail, venues])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
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
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId,
          venueId: formData.venueId,
          clientName: formData.clientName,
          clientPhone: formData.clientPhone,
          clientEmail: formData.clientEmail,
          date: formData.date,
          timeSlot: formData.timeSlot,
          grossAmount: 5000,
        }),
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("الـ API لا يعمل بشكل صحيح")
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "حدث خطأ في الحجز")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/booking/${data.booking.id}`)
      }, 3000)
    } catch (err: any) {
      console.error("Booking error:", err)
      setError(err.message || "حدث خطأ في الحجز")
    } finally {
      setLoading(false)
    }
  }

  if (!isMounted) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-background-subtle dark:bg-dark-surface rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 dark:bg-accent-dark/20 mb-4">
          <CheckCircle2 className="text-accent" size={32} />
        </div>
        <h3 className="text-xl font-bold mb-2 text-accent">تم إرسال الحجز بنجاح!</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          سيتم مراجعة طلبك من قبل الإدارة
        </p>
        <p className="text-xs text-gray-400">
          جاري تحويلك لصفحة تفاصيل الحجز...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-sm text-red-600 dark:text-red-400 font-semibold">{error}</p>
        </div>
      )}

      {!userEmail && (
        <div className="bg-accent/10 dark:bg-accent-dark/20 border border-accent/20 dark:border-accent-dark/30 rounded-xl p-3 text-center">
          <p className="text-sm text-primary dark:text-accent mb-2 font-semibold">يجب تسجيل الدخول أولاً</p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-xs text-primary dark:text-accent font-bold underline"
          >
            تسجيل الدخول
          </button>
        </div>
      )}

      {/* Client Name */}
      <div>
        <label className="block text-sm font-semibold text-primary dark:text-white mb-1.5">
          الاسم الكامل *
        </label>
        <div className="relative">
          <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            placeholder="أدخل اسمك"
            required
            className="input-modern pr-10"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-semibold text-primary dark:text-white mb-1.5">
          رقم الهاتف *
        </label>
        <div className="relative">
          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="tel"
            value={formData.clientPhone}
            onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
            placeholder="01xxxxxxxxx"
            required
            className="input-modern pr-10"
            dir="ltr"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-primary dark:text-white mb-1.5">
          البريد الإلكتروني
        </label>
        <div className="relative">
          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="email"
            value={formData.clientEmail}
            onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
            placeholder="example@email.com"
            className="input-modern pr-10"
            dir="ltr"
          />
        </div>
      </div>

      {/* Venue */}
      <div>
        <label className="block text-sm font-semibold text-primary dark:text-white mb-1.5">
          المكان *
        </label>
        <div className="relative">
          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <select
            value={formData.venueId}
            onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
            required
            className="input-modern pr-10 appearance-none"
          >
            <option value="">اختر المكان</option>
            {venues.map((venue) => (
              <option key={venue.id} value={venue.id} className="bg-white dark:bg-dark-surface">
                {venue.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-semibold text-primary dark:text-white mb-1.5">
          تاريخ الفعالية *
        </label>
        <div className="relative">
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            min={new Date().toISOString().split("T")[0]}
            className="input-modern pr-10"
          />
        </div>
      </div>

      {/* Time Slot */}
      <div>
        <label className="block text-sm font-semibold text-primary dark:text-white mb-1.5">الفترة *</label>
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
              className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                formData.timeSlot === slot.value
                  ? "bg-primary text-white shadow-soft dark:bg-accent dark:text-primary-dark"
                  : "bg-background-subtle dark:bg-dark-surface text-gray-600 dark:text-gray-300 hover:bg-accent/10 dark:hover:bg-accent-dark/20 border border-gray-200 dark:border-dark-border"
              }`}
            >
              {slot.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !userEmail}
        className="btn-primary w-full flex items-center justify-center gap-2 py-4 mt-4"
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