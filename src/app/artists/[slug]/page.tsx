"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar as CalendarIcon, Star, X, Loader2, ChevronLeft, ChevronRight, AlertCircle, Music } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import ReviewsList from "@/components/ReviewsList"
import FluidBackground from "@/components/FluidBackground"

interface Slot {
  date: string
  timeSlot: string
  status: string
}

interface Pricing {
  id: string
  governorate: string
  basePrice: number
  transportationFee: number
}

interface Artist {
  id: string
  name: string
  slug: string
  category: string | null
  bio: string | null
  profileImage: string | null
  coverImage: string | null
  accentColor: string
  availability: Slot[]
  pricing: Pricing[]
  rating?: number
  reviewCount?: number
}

// قائمة المحافظات المصرية
const GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "الشرقية",
  "القليوبية", "المنوفية", "الغربية", "كفر الشيخ", "البحيرة",
  "المنيا", "بني سويف", "الفيوم", "أسيوط", "سوهاج",
  "قنا", "الأقصر", "أسوان", "البحر الأحمر", "الوادي الجديد",
  "مطروح", "شمال سيناء", "جنوب سيناء", "بورسعيد", "الإسماعيلية",
  "السويس", "دمياط"
]

export default function ArtistDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [artist, setArtist] = useState<Artist | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedGovernorate, setSelectedGovernorate] = useState("")
  const [priceSummary, setPriceSummary] = useState({
    basePrice: 0,
    transportFee: 0,
    total: 0,
    deposit: 0,
    remaining: 0,
  })
  const [bookingData, setBookingData] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    venueName: "",
    venueAddress: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [bookingSuccessId, setBookingSuccessId] = useState<string | null>(null)
  const sidePanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const slug = params.slug as string
    console.log("🎨 Loading artist:", slug)
    
    fetch(`/api/artists/${encodeURIComponent(slug)}`)
      .then(async res => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.error || "Artist not found")
        }
        return res.json()
      })
      .then(data => {
        console.log("✅ Artist loaded:", data.name)
        setArtist(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("❌ Load error:", err.message)
        setLoading(false)
      })
  }, [params.slug])

  // دالة حساب السعر عند اختيار المحافظة
  const calculatePrice = (governorate: string) => {
    if (!artist?.pricing || governorate === "" || governorate === "أخرى") {
      setPriceSummary({ basePrice: 0, transportFee: 0, total: 0, deposit: 0, remaining: 0 })
      return
    }
    
    const pricing = artist.pricing.find(p => p.governorate === governorate)
    
    if (pricing) {
      const total = pricing.basePrice + pricing.transportationFee
      const deposit = Math.max(5000, Math.round(total * 0.3))
      const remaining = total - deposit
      
      setPriceSummary({
        basePrice: pricing.basePrice,
        transportFee: pricing.transportationFee,
        total,
        deposit,
        remaining,
      })
    } else {
      setPriceSummary({ basePrice: 0, transportFee: 0, total: 0, deposit: 0, remaining: 0 })
    }
  }

  const formatDate = (date: Date | string): string => {
    if (typeof date === "string") {
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const getSlotsForDate = (dateString: string) => {
    if (!artist?.availability) return []
    const target = formatDate(dateString)
    return artist.availability.filter(s => formatDate(s.date) === target)
  }

  const hasAvailableSlots = (dateString: string) => {
    const slots = getSlotsForDate(dateString)
    if (slots.length === 0) return true
    return slots.some(s => s.status === "AVAILABLE")
  }

  const isFullyBooked = (dateString: string) => {
    const slots = getSlotsForDate(dateString)
    if (slots.length === 0) return false
    return slots.length > 0 && slots.every(s => s.status === "BOOKED")
  }

  const isPastDate = (dateString: string) => formatDate(dateString) < formatDate(new Date())
  const isToday = (dateString: string) => formatDate(dateString) === formatDate(new Date())

  const handleDateClick = (dateString: string) => {
    if (isPastDate(dateString)) return
    setSelectedDate(dateString)
    setTimeout(() => {
      sidePanelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 100)
  }

  const handleTimeSlotSelect = (slot: Slot) => {
    setSelectedSlot(slot.timeSlot)
    setShowBookingModal(true)
    setBookingSuccessId(null)
    setSelectedGovernorate("")
    setPriceSummary({ basePrice: 0, transportFee: 0, total: 0, deposit: 0, remaining: 0 })
  }

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSlot || !artist || !selectedDate || !selectedGovernorate) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId: artist.id,
          date: selectedDate,
          timeSlot: selectedSlot,
          governorate: selectedGovernorate,
          ...bookingData,
        }),
      })

      if (res.ok) {
        const bookingResult = await res.json()
        setBookingSuccessId(bookingResult.id)

        setArtist(prev => {
          if (!prev) return prev
          const existingSlots = prev.availability.filter(s => formatDate(s.date) === formatDate(selectedDate))
          
          if (existingSlots.length > 0) {
            return {
              ...prev,
              availability: prev.availability.map(s => {
                if (formatDate(s.date) === formatDate(selectedDate) && s.timeSlot === selectedSlot) {
                  return { ...s, status: "BOOKED" }
                }
                return s
              })
            }
          }
          
          return {
            ...prev,
            availability: [
              ...prev.availability,
              { date: selectedDate, timeSlot: selectedSlot, status: "BOOKED" }
            ]
          }
        })
        setSelectedDate(null)
      } else {
        const error = await res.json()
        alert(error.error || "فشل الحجز")
      }
    } catch (err) {
      alert("حدث خطأ أثناء الحجز")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#1a0a04]">
        <FluidBackground scrimStrength="medium" />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto animate-spin text-yellow-500 mb-4" size={40} />
            <p className="text-white/60">جاري التحميل...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="relative min-h-screen bg-[#1a0a04]">
        <FluidBackground scrimStrength="medium" />
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center">
          <AlertCircle className="text-red-400 mb-4" size={48} />
          <p className="text-xl text-red-400 mb-4">الفنان غير موجود</p>
          <Link href="/artists" className="text-yellow-500 hover:text-yellow-400">العودة للفنانين</Link>
        </div>
      </div>
    )
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const hasPricing = artist.pricing && artist.pricing.length > 0

  return (
    <div className="relative min-h-screen bg-[#1a0a04]">
      <FluidBackground scrimStrength="medium" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 py-4 px-4 sticky top-0 bg-black/40 backdrop-blur-xl z-40">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-white/60 hover:text-white transition">
              <ArrowLeft size={20} /> العودة
            </button>
            <Link href="/" className="text-2xl font-bold text-yellow-500">Nooryi Studio</Link>
          </div>
        </header>

        {/* Cover Image */}
        <div className="relative h-64 md:h-96 w-full overflow-hidden">
          {artist.coverImage ? (
            <Image
              src={artist.coverImage}
              alt={`غلاف ${artist.name}`}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${artist.accentColor}20` }}>
              <Music size={80} style={{ color: artist.accentColor }} className="opacity-50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a04] via-[#1a0a04]/60 to-transparent" />
        </div>

        {/* Artist Info */}
        <div className="max-w-6xl mx-auto px-4 -mt-24 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative w-40 h-40 rounded-full border-4 border-[#1a0a04] overflow-hidden bg-white/10 backdrop-blur-xl flex-shrink-0 shadow-2xl">
              {artist.profileImage ? (
                <Image
                  src={artist.profileImage}
                  alt={artist.name}
                  fill
                  sizes="160px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold" style={{ color: artist.accentColor }}>
                  {artist.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1 pt-4">
              <div
                className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 backdrop-blur-md"
                style={{
                  backgroundColor: `${artist.accentColor}20`,
                  color: artist.accentColor,
                  border: `1px solid ${artist.accentColor}40`
                }}
              >
                {artist.category || "Artist"}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">{artist.name}</h1>
              <p className="text-white/70 text-lg mb-8">
                {artist.bio || "فنان محترف جاهز لإحياء حفلتك الخاصة."}
              </p>
            </div>
          </div>

          {/* تنبيه الأسعار */}
          {!hasPricing && (
            <div className="mt-8 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-400 text-sm">
              ⚠️ لم يتم تحديد أسعار هذا الفنان بعد. سيتم التواصل معك لتحديد السعر النهائي.
            </div>
          )}

          {/* Calendar Section */}
          <div className="mt-16 pb-16">
            <div className="flex items-center gap-3 mb-8">
              <CalendarIcon className="text-yellow-500" size={24} />
              <h2 className="text-2xl font-bold text-white">اختر موعد حجزك</h2>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <div className="lg:col-span-2 bg-white/8 backdrop-blur-xl border border-white/16 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg transition text-white">
                    <ChevronRight size={24} />
                  </button>
                  <h3 className="text-xl font-bold text-white">
                    {currentMonth.toLocaleDateString("ar-EG", { month: "long", year: "numeric" })}
                  </h3>
                  <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg transition text-white">
                    <ChevronLeft size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"].map(day => (
                    <div key={day} className="text-center text-xs font-bold text-white/50 py-2">{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                    const dateString = formatDate(date)
                    const past = isPastDate(dateString)
                    const today = isToday(dateString)
                    const selected = selectedDate && formatDate(selectedDate) === dateString
                    const fullyBooked = isFullyBooked(dateString)
                    const hasAvailable = hasAvailableSlots(dateString)

                    let className = "aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-bold transition "

                    if (past) {
                      className += "text-white/20 cursor-not-allowed"
                    } else if (selected) {
                      className += "bg-yellow-600 text-black shadow-lg shadow-yellow-600/20 cursor-pointer"
                    } else if (fullyBooked) {
                      className += "bg-red-500/10 text-red-400 border border-red-500/30 cursor-pointer"
                    } else if (hasAvailable) {
                      className += "bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 cursor-pointer"
                    } else {
                      className += "text-white/50 bg-white/5 hover:bg-white/10 cursor-pointer"
                    }

                    return (
                      <button
                        key={day}
                        onClick={() => !past && handleDateClick(dateString)}
                        disabled={past}
                        className={className}
                      >
                        <span>{day}</span>
                        {today && !selected && <span className="w-1 h-1 rounded-full bg-yellow-500 mt-1" />}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30"></div>
                    <span className="text-white/60">متاح للحجز</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-600"></div>
                    <span className="text-white/60">اليوم المختار</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/30"></div>
                    <span className="text-white/60">محجوز بالكامل</span>
                  </div>
                </div>
              </div>

              {/* Side Panel */}
              <div ref={sidePanelRef} className="bg-white/8 backdrop-blur-xl border border-white/16 rounded-2xl p-6 h-fit sticky top-24">
                {selectedDate ? (
                  <>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {new Date(selectedDate + "T00:00:00").toLocaleDateString("ar-EG", {
                        weekday: "long",
                        day: "numeric",
                        month: "long"
                      })}
                    </h3>
                    <p className="text-sm text-white/60 mb-6">اختر الفترة المناسبة لك:</p>

                    <div className="space-y-3">
                      {(() => {
                        const slots = getSlotsForDate(selectedDate)
                        const allTimeSlots = ["MORNING", "AFTERNOON", "EVENING"]
                        
                        if (slots.length === 0) {
                          return allTimeSlots.map(timeSlot => (
                            <button
                              key={timeSlot}
                              onClick={() => handleTimeSlotSelect({ 
                                date: selectedDate!, 
                                timeSlot, 
                                status: "AVAILABLE" 
                              })}
                              className="w-full flex items-center justify-between p-4 rounded-lg transition group backdrop-blur-md bg-black/40 border border-white/10 hover:border-yellow-500 cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">
                                  {timeSlot === "MORNING" ? "🌅" : timeSlot === "AFTERNOON" ? "☀️" : "🌙"}
                                </span>
                                <div className="text-right">
                                  <p className="font-bold text-white group-hover:text-yellow-500 transition">
                                    {timeSlot === "MORNING" ? "صباحاً" : timeSlot === "AFTERNOON" ? "ظهراً" : "مساءً"}
                                  </p>
                                  <p className="text-xs text-white/50">
                                    {timeSlot === "MORNING" ? "9ص - 12ظ" : timeSlot === "AFTERNOON" ? "12ظ - 5م" : "5م - 11م"}
                                  </p>
                                </div>
                              </div>
                              <ChevronLeft className="text-white/50 group-hover:text-yellow-500 transition" size={20} />
                            </button>
                          ))
                        }
                        
                        return slots.map(slot => {
                          const isAvailable = slot.status === "AVAILABLE"
                          const timeSlotLabel = slot.timeSlot === "MORNING" ? "صباحاً" :
                            slot.timeSlot === "AFTERNOON" ? "ظهراً" : "مساءً"
                          const timeSlotIcon = slot.timeSlot === "MORNING" ? "🌅" :
                            slot.timeSlot === "AFTERNOON" ? "☀️" : "🌙"

                          return (
                            <button
                              key={slot.timeSlot}
                              onClick={() => isAvailable && handleTimeSlotSelect(slot)}
                              disabled={!isAvailable}
                              className={`w-full flex items-center justify-between p-4 rounded-lg transition group backdrop-blur-md ${
                                isAvailable
                                  ? "bg-black/40 border border-white/10 hover:border-yellow-500 cursor-pointer"
                                  : "bg-red-500/5 border border-red-500/20 cursor-not-allowed opacity-60"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{timeSlotIcon}</span>
                                <div className="text-right">
                                  <p className={`font-bold ${isAvailable ? "text-white group-hover:text-yellow-500" : "text-red-400"} transition`}>
                                    {timeSlotLabel}
                                  </p>
                                  <p className="text-xs text-white/50">
                                    {slot.timeSlot === "MORNING" ? "9ص - 12ظ" :
                                      slot.timeSlot === "AFTERNOON" ? "12ظ - 5م" : "5م - 11م"}
                                  </p>
                                </div>
                              </div>
                              {isAvailable ? (
                                <ChevronLeft className="text-white/50 group-hover:text-yellow-500 transition" size={20} />
                              ) : (
                                <span className="text-xs text-red-400 font-bold">محجوز</span>
                              )}
                            </button>
                          )
                        })
                      })()}
                    </div>

                    {getSlotsForDate(selectedDate).length === 0 && (
                      <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-xs">
                        💡 جميع الفترات متاحة في هذا اليوم
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="mx-auto text-white/30 mb-3" size={48} />
                    <p className="text-white/60">اختر يوماً من التقويم لعرض الفترات المتاحة</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-16 pb-16">
            <div className="flex items-center gap-3 mb-8">
              <Star className="text-yellow-500" size={24} />
              <h2 className="text-2xl font-bold text-white">تقييمات العملاء</h2>
            </div>
            <ReviewsList artistSlug={artist.slug} />
          </div>
        </div>

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a0a04]/95 backdrop-blur-2xl border border-white/16 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">تأكيد الحجز</h3>
                  <button onClick={() => setShowBookingModal(false)} className="text-white/60 hover:text-white transition">
                    <X size={24} />
                  </button>
                </div>

                {bookingSuccessId ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="text-green-400" size={32} />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">تم استلام طلب الحجز!</h4>
                    <p className="text-white/60 mb-6">
                      الخطوة التالية: ادفع العربون لتأكيد حجزك.
                    </p>
                    <button
                      onClick={() => {
                        window.location.href = `/booking/${bookingSuccessId}/payment`
                      }}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 rounded-lg transition mb-3"
                    >
                      💳 ادفع العربون الآن
                    </button>
                    <button
                      onClick={() => setShowBookingModal(false)}
                      className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg transition"
                    >
                      الدفع لاحقاً
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitBooking} className="space-y-4">
                    {/* تفاصيل الحجز */}
                    <div className="bg-black/40 border border-white/10 rounded-lg p-4 mb-4">
                      <p className="text-sm text-white/60 mb-1">تفاصيل الحجز:</p>
                      <p className="text-white font-bold">
                        {artist.name} - {new Date(selectedDate! + "T00:00:00").toLocaleDateString("ar-EG", {
                          weekday: "long",
                          day: "numeric",
                          month: "long"
                        })} - {selectedSlot === "MORNING" ? "صباحاً" : selectedSlot === "AFTERNOON" ? "ظهراً" : "مساءً"}
                      </p>
                    </div>

                    {/* اختيار المحافظة */}
                    <div>
                      <label className="block text-sm text-white/70 mb-2">المحافظة / المنطقة *</label>
                      <select
                        required
                        value={selectedGovernorate}
                        onChange={(e) => {
                          setSelectedGovernorate(e.target.value)
                          calculatePrice(e.target.value)
                        }}
                        className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-yellow-500 outline-none transition"
                      >
                        <option value="">اختر المحافظة...</option>
                        {GOVERNORATES.map(gov => (
                          <option key={gov} value={gov}>{gov}</option>
                        ))}
                        <option value="أخرى">محافظة أخرى (سيتم التواصل لتحديد السعر)</option>
                      </select>
                    </div>

                    {/* ملخص الأسعار */}
                    {selectedGovernorate && selectedGovernorate !== "أخرى" && priceSummary.total > 0 && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 space-y-2">
                        <h4 className="text-yellow-400 font-bold text-sm mb-2">💰 ملخص التكلفة</h4>
                        <div className="flex justify-between text-sm text-white/80">
                          <span>سعر الأداء:</span>
                          <span>{priceSummary.basePrice.toLocaleString()} ج.م</span>
                        </div>
                        <div className="flex justify-between text-sm text-white/80">
                          <span>مصاريف الانتقال:</span>
                          <span>{priceSummary.transportFee.toLocaleString()} ج.م</span>
                        </div>
                        <div className="border-t border-yellow-500/30 pt-2 flex justify-between font-bold text-white">
                          <span>الإجمالي:</span>
                          <span>{priceSummary.total.toLocaleString()} ج.م</span>
                        </div>
                        <div className="flex justify-between font-bold text-green-400 text-sm mt-1">
                          <span>العربون المطلوب الآن:</span>
                          <span>{priceSummary.deposit.toLocaleString()} ج.م</span>
                        </div>
                        <p className="text-xs text-white/50 mt-2">
                          * يتم دفع المتبقي ({priceSummary.remaining.toLocaleString()} ج.م) قبل الحفل بـ 48 ساعة.
                        </p>
                      </div>
                    )}

                    {/* تنبيه للمحافظات الأخرى */}
                    {selectedGovernorate === "أخرى" && (
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-blue-400 text-sm">
                        💡 سنقوم بالتواصل معك لتحديد السعر النهائي بناءً على موقع الحفل.
                      </div>
                    )}

                    {/* تنبيه لو المحافظة مش في قائمة الأسعار */}
                    {selectedGovernorate && selectedGovernorate !== "أخرى" && priceSummary.total === 0 && hasPricing && (
                      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-orange-400 text-sm">
                        ⚠️ لم يتم تحديد سعر لهذه المحافظة بعد. سيتم التواصل معك لتحديد السعر.
                      </div>
                    )}

                    {/* بيانات العميل */}
                    <div>
                      <label className="block text-sm text-white/70 mb-2">الاسم الكامل *</label>
                      <input
                        type="text"
                        required
                        value={bookingData.clientName}
                        onChange={(e) => setBookingData({ ...bookingData, clientName: e.target.value })}
                        className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-yellow-500 outline-none transition"
                        placeholder="اكتب اسمك"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-white/70 mb-2">رقم الهاتف *</label>
                      <input
                        type="tel"
                        required
                        value={bookingData.clientPhone}
                        onChange={(e) => setBookingData({ ...bookingData, clientPhone: e.target.value })}
                        className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-yellow-500 outline-none transition"
                        placeholder="01xxxxxxxxx"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-white/70 mb-2">البريد الإلكتروني (اختياري)</label>
                      <input
                        type="email"
                        value={bookingData.clientEmail}
                        onChange={(e) => setBookingData({ ...bookingData, clientEmail: e.target.value })}
                        className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-yellow-500 outline-none transition"
                        placeholder="email@example.com"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-white/70 mb-2">اسم المكان / القاعة</label>
                      <input
                        type="text"
                        value={bookingData.venueName}
                        onChange={(e) => setBookingData({ ...bookingData, venueName: e.target.value })}
                        className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-yellow-500 outline-none transition"
                        placeholder="مثال: قاعة سما"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !selectedGovernorate}
                      className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                      {submitting ? <Loader2 size={20} className="animate-spin" /> : <CalendarIcon size={20} />}
                      {submitting 
                        ? "جاري الحجز..." 
                        : priceSummary.deposit > 0 
                          ? `تأكيد الحجز ودفع ${priceSummary.deposit.toLocaleString()} ج.م`
                          : "تأكيد الحجز"
                      }
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}