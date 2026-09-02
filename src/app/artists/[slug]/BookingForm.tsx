"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Globe,
  DollarSign,
  Info,
} from "lucide-react"

interface BookingFormProps {
  artistId: string
  artistName: string
  artistSlug: string
  venues: { id: string; name: string; address: string }[]
  userEmail: string
  userName: string
}

const COUNTRY_CODES = [
  { code: "+20", name: "مصر", flag: "🇪🇬" },
  { code: "+966", name: "السعودية", flag: "🇸🇦" },
  { code: "+971", name: "الإمارات", flag: "🇦🇪" },
  { code: "+965", name: "الكويت", flag: "🇰🇼" },
  { code: "+974", name: "قطر", flag: "🇶🇦" },
  { code: "+973", name: "البحرين", flag: "🇧🇭" },
  { code: "+968", name: "عُمان", flag: "🇴🇲" },
  { code: "+962", name: "الأردن", flag: "🇯🇴" },
  { code: "+961", name: "لبنان", flag: "🇱🇧" },
  { code: "+964", name: "العراق", flag: "🇮🇶" },
  { code: "+963", name: "سوريا", flag: "🇸🇾" },
  { code: "+218", name: "ليبيا", flag: "🇱🇾" },
  { code: "+216", name: "تونس", flag: "🇹🇳" },
  { code: "+213", name: "الجزائر", flag: "🇩🇿" },
  { code: "+212", name: "المغرب", flag: "🇲🇦" },
  { code: "+249", name: "السودان", flag: "🇸🇩" },
  { code: "+967", name: "اليمن", flag: "🇾🇪" },
  { code: "+970", name: "فلسطين", flag: "🇵🇸" },
  { code: "+1", name: "أمريكا/كندا", flag: "🇺🇸" },
  { code: "+44", name: "بريطانيا", flag: "🇬🇧" },
  { code: "+33", name: "فرنسا", flag: "🇫🇷" },
  { code: "+49", name: "ألمانيا", flag: "🇩🇪" },
  { code: "+39", name: "إيطاليا", flag: "🇮🇹" },
  { code: "+34", name: "إسبانيا", flag: "🇪🇸" },
  { code: "+90", name: "تركيا", flag: "🇹🇷" },
  { code: "+7", name: "روسيا", flag: "🇷🇺" },
  { code: "+86", name: "الصين", flag: "🇨🇳" },
  { code: "+91", name: "الهند", flag: "🇮🇳" },
  { code: "+61", name: "أستراليا", flag: "🇦🇺" },
]

export default function BookingForm({
  artistId,
  artistName,
  artistSlug,
  venues,
  userEmail,
  userName,
}: BookingFormProps) {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successBookingId, setSuccessBookingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [errorDetails, setErrorDetails] = useState("")

  const [pricingRegions, setPricingRegions] = useState<any[]>([])
  const [pricingLoading, setPricingLoading] = useState(true)
  const [dateAvailable, setDateAvailable] = useState<boolean | null>(null)
  const [availabilityMessage, setAvailabilityMessage] = useState("")

  const [formData, setFormData] = useState({
    clientName: "",
    countryCode: "+20",
    phoneNumber: "",
    clientEmail: "",
    venueId: "",
    region: "",
    date: "",
    timeSlot: "EVENING",
  })

  // ✅ استخدام API عام (بدون مصادقة)
  useEffect(() => {
    const fetchPricing = async () => {
      setPricingLoading(true)
      try {
        const res = await fetch(`/api/artists/${artistSlug}/pricing-regions`)
        if (!res.ok) throw new Error("Failed to fetch pricing")
        const result = await res.json()
        
        const regionsArray = Array.isArray(result) 
          ? result 
          : (result.data || result.regions || [])
        
        console.log("✅ تم جلب المناطق:", regionsArray.length)
        setPricingRegions(regionsArray)
      } catch (err) {
        console.error("Error fetching pricing:", err)
        setPricingRegions([])
      } finally {
        setPricingLoading(false)
      }
    }
    if (artistSlug) fetchPricing()
  }, [artistSlug])

  useEffect(() => {
    setIsMounted(true)
    setFormData({
      clientName: userName || "",
      countryCode: "+20",
      phoneNumber: "",
      clientEmail: userEmail || "",
      venueId: venues[0]?.id || "",
      region: "",
      date: "",
      timeSlot: "EVENING",
    })
  }, [userName, userEmail, venues])

  // ✅ حساب السعر تلقائياً عند تغيير المنطقة
  const currentPricing = useMemo(() => {
    if (!formData.region) return null
    return pricingRegions.find((r) => r.regionName === formData.region)
  }, [formData.region, pricingRegions])

  const basePrice = currentPricing?.basePrice || 5000
  const travelFee = currentPricing?.travelFee || 0
  const totalPrice = basePrice + travelFee
  const depositAmount = Math.round(totalPrice * 0.2)

  // ✅ Debug: طباعة السعر عند تغييره
  useEffect(() => {
    if (currentPricing) {
      console.log(`💰 تم اختيار المنطقة: ${currentPricing.regionName}`)
      console.log(`   السعر الأساسي: ${basePrice}`)
      console.log(`   رسوم السفر: ${travelFee}`)
      console.log(`   الإجمالي: ${totalPrice}`)
      console.log(`   العربون: ${depositAmount}`)
    }
  }, [currentPricing, basePrice, travelFee, totalPrice, depositAmount])

  useEffect(() => {
    if (!formData.date) {
      setDateAvailable(null)
      setAvailabilityMessage("")
      return
    }

    const checkAvailability = async () => {
      setCheckingAvailability(true)
      try {
        const res = await fetch(
          `/api/bookings/check-availability?artistId=${artistId}&date=${formData.date}`
        )
        const result = await res.json()

        if (result.success) {
          setDateAvailable(result.available)
          setAvailabilityMessage(
            result.available ? "✓ هذا اليوم متاح للحجز" : "✗ هذا اليوم محجوز أو غير متاح"
          )
        } else {
          setDateAvailable(null)
          setAvailabilityMessage("")
        }
      } catch (err) {
        console.error("Error checking availability:", err)
        setDateAvailable(null)
      } finally {
        setCheckingAvailability(false)
      }
    }

    const timeout = setTimeout(checkAvailability, 500)
    return () => clearTimeout(timeout)
  }, [formData.date, artistId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setLoading(true)
    setError("")
    setErrorDetails("")

    if (!userEmail) {
      setError("يجب تسجيل الدخول أولاً")
      setLoading(false)
      router.push(`/login?callbackUrl=/artists/${artistSlug}`)
      return
    }

    if (!formData.clientName || !formData.phoneNumber || !formData.date || !formData.venueId) {
      setError("يرجى ملء جميع الحقول المطلوبة")
      setLoading(false)
      return
    }

    if (!formData.region && pricingRegions.length > 0) {
      setError("يرجى اختيار المنطقة")
      setLoading(false)
      return
    }

    if (dateAvailable === false) {
      setError("هذا التاريخ غير متاح، يرجى اختيار تاريخ آخر")
      setLoading(false)
      return
    }

    const fullPhoneNumber = `${formData.countryCode}${formData.phoneNumber.replace(/^0+/, "")}`

    const bookingData = {
      artistId,
      venueId: formData.venueId,
      clientName: formData.clientName,
      clientPhone: fullPhoneNumber,
      countryCode: formData.countryCode,
      phoneNumber: formData.phoneNumber,
      region: formData.region,
      clientEmail: formData.clientEmail,
      date: formData.date,
      timeSlot: formData.timeSlot,
      grossAmount: totalPrice,
      depositAmount: depositAmount,
      travelFee: travelFee,
    }

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      })

      const contentType = response.headers.get("content-type")
      let data: any = null

      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        const text = await response.text()
        console.error("استجابة غير JSON:", text.substring(0, 200))
        throw new Error("الخادم أرجع استجابة غير صحيحة")
      }

      if (!response.ok) {
        throw new Error(data?.error || `خطأ في الخادم (${response.status})`)
      }

      if (!data.success || !data.booking?.id) {
        throw new Error("لم يتم إنشاء الحجز بشكل صحيح")
      }

      setSuccess(true)
      setSuccessBookingId(data.booking.id)

      setTimeout(() => {
        window.location.href = `/booking/${data.booking.id}`
      }, 2000)
    } catch (err: any) {
      setError(err.message || "حدث خطأ في الحجز")
      if (err.message?.includes("Foreign key constraint")) {
        setErrorDetails("خطأ في قاعدة البيانات - تحقق من وجود الفنان والمكان")
      } else if (err.message?.includes("Unique constraint")) {
        setErrorDetails("هذا الحجز موجود بالفعل")
      }
    } finally {
      setLoading(false)
    }
  }

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === formData.countryCode)

  if (!isMounted) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-background-subtle dark:bg-dark-surface rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (success && successBookingId) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 dark:bg-accent-dark/20 mb-4">
          <CheckCircle2 className="text-accent" size={32} />
        </div>
        <h3 className="text-xl font-bold mb-2 text-accent">تم إرسال الحجز بنجاح!</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          رقم الحجز: <span className="font-mono font-bold">#{successBookingId.slice(0, 8).toUpperCase()}</span>
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          سيتم مراجعة طلبك من قبل الإدارة
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin" />
          جاري تحويلك لصفحة تفاصيل الحجز...
        </div>
        <button
          onClick={() => window.location.href = `/booking/${successBookingId}`}
          className="mt-4 text-xs text-accent font-bold underline"
        >
          إذا لم يتم التحويل تلقائياً، اضغط هنا
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
          <div>
            <p className="text-sm text-red-600 dark:text-red-400 font-semibold">{error}</p>
            {errorDetails && (
              <p className="text-xs text-red-500 mt-1">{errorDetails}</p>
            )}
          </div>
        </div>
      )}

      {!userEmail && (
        <div className="bg-accent/10 dark:bg-accent-dark/20 border border-accent/20 dark:border-accent-dark/30 rounded-xl p-3 text-center">
          <p className="text-sm text-primary dark:text-accent mb-2 font-semibold">
            يجب تسجيل الدخول أولاً
          </p>
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
          رقم الهاتف * <span className="text-xs text-gray-500">(دولي)</span>
        </label>
        <div className="flex gap-2">
          <div className="relative w-32 flex-shrink-0">
            <Globe className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            <select
              value={formData.countryCode}
              onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
              className="input-modern pr-8 pl-2 text-xs font-bold"
              dir="ltr"
            >
              {COUNTRY_CODES.map((country) => (
                <option key={country.code} value={country.code} className="bg-white dark:bg-dark-surface">
                  {country.flag} {country.code}
                </option>
              ))}
            </select>
          </div>
          <div className="relative flex-1">
            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value.replace(/[^\d]/g, "") })
              }
              placeholder={formData.countryCode === "+20" ? "1xxxxxxxxx" : "رقم الهاتف بدون الصفر"}
              required
              className="input-modern pr-10"
              dir="ltr"
            />
          </div>
        </div>
        {selectedCountry && formData.phoneNumber && (
          <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1" dir="ltr">
            <Info size={12} />
            الرقم الكامل: {formData.countryCode}{formData.phoneNumber.replace(/^0+/, "")}
          </p>
        )}
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

      {/* Region - اختيار المنطقة */}
      {pricingLoading ? (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-primary dark:text-white mb-1.5">
            المنطقة / المدينة *
          </label>
          <div className="h-12 bg-background-subtle dark:bg-dark-surface rounded-xl animate-pulse" />
        </div>
      ) : pricingRegions.length > 0 ? (
        <div>
          <label className="block text-sm font-semibold text-primary dark:text-white mb-1.5">
            المنطقة / المدينة *
          </label>
          <div className="relative">
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              required
              className="input-modern pr-10 appearance-none"
            >
              <option value="">-- اختر المنطقة --</option>
              {pricingRegions.map((region) => {
                const regionTotal = region.basePrice + (region.travelFee || 0)
                return (
                  <option
                    key={region.id}
                    value={region.regionName}
                    className="bg-white dark:bg-dark-surface"
                  >
                    {region.regionName} - {regionTotal.toLocaleString()} ج.م
                  </option>
                )
              })}
            </select>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-xl p-3 text-center">
          <p className="text-xs text-yellow-700 dark:text-yellow-400">
            لا توجد مناطق مسعرة لهذا الفنان
          </p>
        </div>
      )}

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
        {formData.date && (
          <div className="mt-2">
            {checkingAvailability ? (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Loader2 size={12} className="animate-spin" />
                جاري التحقق من التوفر...
              </div>
            ) : dateAvailable !== null ? (
              <div
                className={`flex items-center gap-2 text-xs font-semibold p-2 rounded-lg ${
                  dateAvailable
                    ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                    : "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                }`}
              >
                {dateAvailable ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {availabilityMessage}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Time Slot */}
      <div>
        <label className="block text-sm font-semibold text-primary dark:text-white mb-1.5">
          الفترة *
        </label>
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

      {/* Price Summary - يتحدث تلقائياً عند تغيير المنطقة */}
      <div className="bg-gradient-to-br from-accent/10 to-primary/5 dark:from-accent-dark/20 dark:to-primary/10 rounded-2xl p-4 border border-accent/20 dark:border-accent-dark/30">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="text-accent" size={18} />
          <p className="text-sm font-bold text-primary dark:text-white">
            ملخص السعر
            {currentPricing && (
              <span className="text-xs text-accent mr-2">- {currentPricing.regionName}</span>
            )}
          </p>
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">السعر الأساسي</span>
            <span className="font-bold text-primary dark:text-white">
              {basePrice.toLocaleString()} ج.م
            </span>
          </div>
          {travelFee > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">رسوم السفر</span>
              <span className="font-bold text-primary dark:text-white">
                +{travelFee.toLocaleString()} ج.م
              </span>
            </div>
          )}
          <div className="pt-2 mt-2 border-t border-accent/20 dark:border-accent-dark/30 flex items-center justify-between">
            <span className="font-bold text-primary dark:text-white">الإجمالي</span>
            <span className="text-lg font-black text-accent">
              {totalPrice.toLocaleString()} ج.م
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-gray-500 dark:text-gray-400">العربون (20%)</span>
            <span className="font-bold text-accent">
              {depositAmount.toLocaleString()} ج.م
            </span>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !userEmail || dateAvailable === false}
        className="btn-primary w-full flex items-center justify-center gap-2 py-4 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
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