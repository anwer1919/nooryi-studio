"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import QRCode from "react-qr-code"
import {
  ArrowLeft, Save, Printer, Calendar,
  ChevronRight, ChevronLeft, Check, X, Filter, Clock,
  Phone, Mail, MapPin, Award
, Shield } from "lucide-react"

const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
]

const DAYS_SHORT_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

type FilterType = "all" | "available" | "unavailable"

// ============ بيانات الاستوديو (عدّلها حسب حاجتك) ============
const STUDIO_INFO = {
  name: "Nooryi Studio",
  nameAr: "استوديو نوري",
  tagline: "منصة حجز الفنانين والفعاليات",
  phone: "+20 100 000 0000",
  email: "info@noorystudio.com",
  address: "القاهرة، جمهورية مصر العربية",
  website: "https://nooryi-studio.vercel.app",
  licenseNumber: "NS-2026-001",
}

// دالة مساعدة لتحويل التاريخ إلى مفتاح
function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export default function ArtistAvailabilityPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [artist, setArtist] = useState<any>(null)

  const [currentDate, setCurrentDate] = useState(new Date())
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set())
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<FilterType>("all")

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, currentDate])

  const fetchData = async () => {
    setLoading(true)
    try {
      // جلب بيانات الفنان
      const artistRes = await fetch(`/api/admin/artists/${slug}`)
      const artistResult = await artistRes.json()
      if (artistResult.success) setArtist(artistResult.data)

      // ✅ جلب الأيام من جدول Availability الفعلي
      const year = currentDate.getFullYear()
      const monthIndex = currentDate.getMonth()

      const slotsRes = await fetch(
        `/api/admin/artists/${slug}/availability?year=${year}&month=${monthIndex + 1}`
      )
      const slotsResult = await slotsRes.json()

      const booked = new Set<string>()
      const available = new Set<string>()

      if (slotsResult.success && slotsResult.data) {
        slotsResult.data.forEach((slot: any) => {
          const d = new Date(slot.date)
          const key = formatDateKey(d)
          if (slot.isBooked) {
            booked.add(key)
          } else {
            available.add(key)
          }
        })
      }

      setBookedDates(booked)
      setAvailableDates(available)
    } catch (err) {
      console.error(err)
      setError("حدث خطأ أثناء تحميل البيانات")
    } finally {
      setLoading(false)
    }
  }

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()

    const days: Array<{ date: Date | null; key: string | null }> = []

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null, key: null })
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      days.push({ date, key: formatDateKey(date) })
    }

    return days
  }, [currentDate])

  const toggleDay = (dateKey: string) => {
    // لا يمكن تعديل الأيام المحجوزة فعلياً
    if (bookedDates.has(dateKey)) return

    setAvailableDates(prev => {
      const newSet = new Set(prev)
      if (newSet.has(dateKey)) newSet.delete(dateKey)
      else newSet.add(dateKey)
      return newSet
    })
  }

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const goToToday = () => setCurrentDate(new Date())

  const selectWeekdaysOnly = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const lastDay = new Date(year, month + 1, 0).getDate()

    setAvailableDates(prev => {
      const newSet = new Set(prev)
      for (let d = 1; d <= lastDay; d++) {
        const date = new Date(year, month, d)
        const dow = date.getDay()
        const key = formatDateKey(date)
        // لا نعدل الأيام المحجوزة
        if (bookedDates.has(key)) continue
        if (dow >= 0 && dow <= 4) newSet.add(key)
        else newSet.delete(key)
      }
      return newSet
    })
  }

  const clearMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const lastDay = new Date(year, month + 1, 0).getDate()

    setAvailableDates(prev => {
      const newSet = new Set(prev)
      for (let d = 1; d <= lastDay; d++) {
        const date = new Date(year, month, d)
        const key = formatDateKey(date)
        // لا نمسح الأيام المحجوزة
        if (bookedDates.has(key)) continue
        newSet.delete(key)
      }
      return newSet
    })
  }

  const handlePrint = () => window.print()

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const year = currentDate.getFullYear()
      const monthIndex = currentDate.getMonth()

      const res = await fetch(`/api/admin/artists/${slug}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          month: monthIndex + 1,
          availableDates: Array.from(availableDates),
          bookedDates: Array.from(bookedDates),
        }),
      })

      const result = await res.json()
      if (result.success) {
        setSuccess("تم حفظ التقويم بنجاح!")
      } else {
        setError(result.error || "فشل في الحفظ")
      }
    } catch (err) {
      setError("حدث خطأ أثناء الحفظ")
    } finally {
      setSaving(false)
    }
  }

  const stats = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const lastDay = new Date(year, month + 1, 0).getDate()

    let available = 0
    let unavailable = 0
    let booked = 0

    for (let d = 1; d <= lastDay; d++) {
      const date = new Date(year, month, d)
      const key = formatDateKey(date)
      if (bookedDates.has(key)) {
        booked++
        unavailable++
      } else if (availableDates.has(key)) {
        available++
      } else {
        unavailable++
      }
    }

    return { available, unavailable, booked, total: lastDay }
  }, [currentDate, availableDates, bookedDates])

  const todayKey = formatDateKey(new Date())
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const reportId = `CAL-${year}${String(month + 1).padStart(2, "0")}-${artist?.id?.slice(-6)?.toUpperCase() || "000000"}`

  // ✅ رابط التحقق: يوجه لصفحة عرض التقويم
  const qrValue = artist?.id
  ? `${STUDIO_INFO.website}/verify/${artist.id}/${year}/${month + 1}`
  : `${STUDIO_INFO.website}/verify/${slug}/${year}/${month + 1}`

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#111]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-bold">جاري تحميل التقويم...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* ============ CSS الطباعة - حجم A4 بالضبط ============ */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            padding: 0;
            background: white !important;
            transform: none;
            box-shadow: none;
            border-radius: 0;
          }
          .no-print { display: none !important; }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          .print-header, .print-footer, .stamp-section {
            break-inside: avoid;
          }
          .calendar-cell {
            height: 13mm !important;
            min-height: 13mm !important;
          }
          .calendar-cell .day-number {
            font-size: 11px !important;
          }
          .calendar-grid {
            gap: 2px !important;
          }
          .calendar-header-cell {
            padding: 6px 3px !important;
            font-size: 11px !important;
          }
          .print-header { padding: 16px !important; }
          .print-footer { padding: 12px 16px !important; }
          .print-header .studio-name { font-size: 22px !important; }
          .print-header .report-title { font-size: 18px !important; }
          .stamp-container {
            width: 100px !important;
            height: 100px !important;
          }
          .qr-box {
            padding: 8px !important;
          }
          .qr-box svg {
            width: 90px !important;
            height: 90px !important;
          }
        }
        
        @keyframes stampRotate {
          from { transform: rotate(-8deg) scale(0.8); opacity: 0; }
          to { transform: rotate(-8deg) scale(1); opacity: 1; }
        }
        
        .official-stamp {
          animation: stampRotate 0.5s ease-out;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">

          {/* ============ Header Controls (لا يطبع) ============ */}
          <div className="mb-6 no-print">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[#D4AF37] hover:text-[#b8941f] font-semibold mb-4 transition"
            >
              <ArrowLeft size={20} /> العودة
            </button>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                  <Calendar size={32} className="text-[#D4AF37]" />
                  تقويم التوفر الشهري
                </h1>
                <p className="text-gray-500">
                  إدارة أيام العمل للفنان{" "}
                  <span className="font-bold text-[#D4AF37]">{artist?.name}</span>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-3 bg-[#111] text-[#D4AF37] rounded-xl font-bold hover:bg-[#222] transition"
                >
                  <Printer size={18} />
                  طباعة التقرير
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-3 bg-[#D4AF37] text-[#111] rounded-xl font-bold hover:bg-[#b8941f] transition disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? "جاري الحفظ..." : "حفظ"}
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-semibold no-print">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold no-print">
              {success}
            </div>
          )}

          {/* ============ Controls (لا يطبع) ============ */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4 no-print">
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                <ChevronRight size={20} className="text-gray-700" />
              </button>

              <div className="flex-1 text-center">
                <h2 className="text-xl font-black text-gray-900">
                  {MONTHS_AR[month]} {year}
                </h2>
              </div>

              <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                <ChevronLeft size={20} className="text-gray-700" />
              </button>

              <button onClick={goToToday} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold transition">
                اليوم
              </button>

              <div className="w-px h-8 bg-gray-200 mx-2 hidden md:block"></div>

              <button onClick={selectWeekdaysOnly} className="px-4 py-2 bg-[#D4AF37] text-[#111] rounded-lg text-sm font-bold hover:bg-[#b8941f] transition">
                أيام العمل فقط
              </button>

              <button onClick={clearMonth} className="px-4 py-2 bg-gray-100 hover:bg-red-100 hover:text-red-700 rounded-lg text-sm font-semibold transition">
                مسح الشهر
              </button>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600 font-semibold ml-1">فلتر:</span>
              {[
                { value: "all", label: "الكل" },
                { value: "available", label: "المتاح فقط" },
                { value: "unavailable", label: "غير المتاح فقط" },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value as FilterType)}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                    filter === f.value
                      ? "bg-[#111] text-[#D4AF37]"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* ============ Stats (لا يطبع) ============ */}
          <div className="grid grid-cols-4 gap-3 mb-4 no-print">
            <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
              <p className="text-xs text-gray-500 font-semibold mb-1">أيام الشهر</p>
              <p className="text-2xl font-black text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-gradient-to-br from-[#D4AF37] to-[#b8941f] p-4 rounded-xl text-center">
              <p className="text-xs text-[#111] font-semibold mb-1 opacity-70">متاح</p>
              <p className="text-2xl font-black text-[#111]">{stats.available}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-700 p-4 rounded-xl text-center">
              <p className="text-xs text-white font-semibold mb-1 opacity-70">محجوز</p>
              <p className="text-2xl font-black text-white">{stats.booked}</p>
            </div>
            <div className="bg-gradient-to-br from-[#111] to-[#333] p-4 rounded-xl text-center">
              <p className="text-xs text-[#D4AF37] font-semibold mb-1 opacity-70">غير متاح</p>
              <p className="text-2xl font-black text-white">{stats.unavailable}</p>
            </div>
          </div>

          {/* ============ منطقة الطباعة ============ */}
          <div className="print-area bg-white rounded-2xl shadow-xl border-2 border-[#D4AF37] overflow-hidden">

            {/* ═══════════ الترويسة الاحترافية ═══════════ */}
            <div className="print-header bg-gradient-to-l from-[#111] via-[#1a1a1a] to-[#111] text-[#D4AF37] relative overflow-hidden">
              <div className="h-2 bg-gradient-to-l from-[#D4AF37] via-[#f4e5b8] to-[#D4AF37]"></div>
              
              <div className="p-6 md:p-8 relative">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center shadow-2xl border-4 border-[#D4AF37]/50">
                      <span className="text-[#111] text-3xl md:text-4xl font-black">N</span>
                    </div>
                    <div>
                      <h1 className="studio-name text-2xl md:text-3xl font-black tracking-wide">{STUDIO_INFO.name}</h1>
                      <p className="text-lg md:text-xl opacity-90 font-semibold">{STUDIO_INFO.nameAr}</p>
                      <p className="text-xs md:text-sm opacity-70">{STUDIO_INFO.tagline}</p>
                    </div>
                  </div>

                  <div className="text-left space-y-1 text-xs md:text-sm">
                    <div className="flex items-center gap-2 justify-end">
                      <span dir="ltr">{STUDIO_INFO.phone}</span>
                      <Phone size={14} />
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <span dir="ltr">{STUDIO_INFO.email}</span>
                      <Mail size={14} />
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <span>{STUDIO_INFO.address}</span>
                      <MapPin size={14} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t-2 border-[#D4AF37]/30 flex items-center justify-between">
                  <div>
                    <h2 className="report-title text-xl md:text-2xl font-black">تقرير التقويم الشهري</h2>
                    <p className="text-lg md:text-xl opacity-90">{MONTHS_AR[month]} {year}</p>
                  </div>

                  <div className="text-left">
                    <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/40 rounded-lg px-4 py-2 inline-block">
                      <p className="text-[10px] opacity-70 mb-1">رقم التقرير</p>
                      <p className="text-base md:text-lg font-black font-mono" dir="ltr">{reportId}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════════ معلومات الفنان ═══════════ */}
            <div className="bg-[#faf8f0] border-b-2 border-[#D4AF37]/30 px-6 md:px-8 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">الفنان</p>
                  <p className="text-sm md:text-base font-bold text-gray-900 truncate">{artist?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">الفئة</p>
                  <p className="text-sm md:text-base font-bold text-gray-900 truncate">{artist?.category || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">أيام متاحة</p>
                  <p className="text-lg md:text-xl font-black text-[#D4AF37]">{stats.available} يوم</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">أيام محجوزة</p>
                  <p className="text-lg md:text-xl font-black text-red-600">{stats.booked} يوم</p>
                </div>
              </div>
            </div>

            {/* ═══════════ جدول التقويم ═══════════ */}
            <div className="p-4 md:p-6 relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
                <span className="text-8xl font-black text-[#111] rotate-[-30deg]">
                  {STUDIO_INFO.name}
                </span>
              </div>

              <div className="calendar-grid grid grid-cols-7 gap-2 relative z-10">
                {DAYS_SHORT_AR.map((day) => (
                  <div
                    key={day}
                    className="calendar-header-cell bg-[#111] text-[#D4AF37] text-center py-2 font-black text-sm md:text-base rounded-lg"
                  >
                    {day}
                  </div>
                ))}

                {calendarDays.map((item, idx) => {
                  if (!item.date || !item.key) {
                    return <div key={`empty-${idx}`} className="calendar-cell aspect-square md:aspect-auto md:h-16"></div>
                  }

                  const isBooked = bookedDates.has(item.key)
                  const isAvailable = availableDates.has(item.key) && !isBooked
                  const isToday = item.key === todayKey
                  const isPast = item.date < new Date(new Date().setHours(0, 0, 0, 0))

                  const shouldHide =
                    (filter === "available" && !isAvailable) ||
                    (filter === "unavailable" && (isAvailable || isBooked))

                  return (
                    <button
                      key={item.key}
                      onClick={() => toggleDay(item.key)}
                      disabled={isPast || isBooked}
                      className={`
                        calendar-cell aspect-square md:aspect-auto md:h-16 rounded-lg font-bold transition-all relative
                        flex items-center justify-center
                        ${shouldHide ? "opacity-20" : "opacity-100"}
                        ${isPast || isBooked ? "cursor-not-allowed" : "cursor-pointer hover:scale-105"}
                        ${isToday ? "ring-2 ring-[#D4AF37]" : ""}
                        ${isBooked
                          ? "bg-gradient-to-br from-red-500 to-red-700 text-white shadow-md"
                          : isAvailable
                            ? "bg-gradient-to-br from-[#D4AF37] to-[#b8941f] text-[#111] shadow-md"
                            : "bg-gradient-to-br from-[#111] to-[#333] text-white"
                        }
                      `}
                    >
                      <span className="day-number text-base md:text-lg font-black">{item.date.getDate()}</span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 pt-4 border-t-2 border-[#D4AF37]/20 flex items-center justify-center gap-6 flex-wrap relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-[#D4AF37] to-[#b8941f]"></div>
                  <span className="text-sm font-bold text-gray-700">يوم متاح للحجز</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-red-500 to-red-700"></div>
                  <span className="text-sm font-bold text-gray-700">يوم محجوز</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-[#111] to-[#333]"></div>
                  <span className="text-sm font-bold text-gray-700">يوم غير متاح</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded border-2 border-[#D4AF37]"></div>
                  <span className="text-sm font-bold text-gray-700">اليوم الحالي</span>
                </div>
              </div>
            </div>

            {/* ═══════════ قسم التوثيق: الختم (يمين) + QR (يسار) ═══════════ */}
            <div className="stamp-section bg-[#faf8f0] border-t-2 border-[#D4AF37]/30 px-6 md:px-8 py-5">
              <div className="flex items-center justify-between gap-6">
                
                {/* ══ QR Code (يسار) ══ */}
                <div className="flex items-center gap-4">
                  <div className="qr-box bg-white p-3 rounded-xl border-2 border-[#111] shadow-lg">
                    <Shield 
                      value={qrValue}
                      size={100}
                      bgColor="#ffffff"
                      fgColor="#111111"
                      level="M"
                    />
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 leading-relaxed">
                    <p className="flex items-center gap-2 font-bold text-gray-900 mb-1">
                      <Shield size={16} className="text-[#D4AF37]" />
                      امسح للتحقق
                    </p>
                    <p>امسح رمز QR للتحقق</p>
                    <p>من صحة هذا التقرير</p>
                    <p className="font-mono text-xs mt-2 text-[#D4AF37] font-bold" dir="ltr">{reportId}</p>
                  </div>
                </div>

                {/* ══ الختم الرسمي (يمين) ══ */}
                <div className="official-stamp stamp-container relative w-28 h-28 md:w-36 md:h-36" style={{ transform: "rotate(-8deg)" }}>
                  <div className="absolute inset-0 rounded-full border-4 border-[#D4AF37] flex items-center justify-center">
                    <div className="absolute inset-2 rounded-full border-2 border-[#D4AF37]"></div>
                    
                    <div className="text-center px-3">
                      <Award className="w-7 h-7 text-[#D4AF37] mx-auto mb-1" />
                      <p className="text-[10px] font-black text-[#D4AF37] leading-tight">
                        {STUDIO_INFO.name}
                      </p>
                      <p className="text-[9px] font-bold text-[#D4AF37] mt-0.5">
                        استوديو معتمد رسمياً
                      </p>
                      <p className="text-[8px] font-semibold text-[#D4AF37] opacity-70 mt-0.5" dir="ltr">
                        {STUDIO_INFO.licenseNumber}
                      </p>
                    </div>
                  </div>

                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[#D4AF37] text-xs">★ ★ ★</div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[#D4AF37] text-xs">★ ★ ★</div>
                </div>
              </div>
            </div>

            {/* ═══════════ التذييل الاحترافي ═══════════ */}
            <div className="print-footer bg-gradient-to-l from-[#111] via-[#1a1a1a] to-[#111] text-[#D4AF37]">
              <div className="px-6 py-4 md:px-8 md:py-5">
                <div className="grid grid-cols-3 gap-4 mb-3 pb-3 border-b border-[#D4AF37]/30">
                  <div>
                    <p className="text-xs opacity-70 mb-1">تاريخ الإصدار</p>
                    <p className="text-sm font-bold" suppressHydrationWarning>
                      {new Date().toLocaleDateString("ar-EG", {
                        year: "numeric", month: "long", day: "numeric"
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70 mb-1">رقم التقرير</p>
                    <p className="text-sm font-bold font-mono" dir="ltr">{reportId}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70 mb-1">الترخيص</p>
                    <p className="text-sm font-bold" dir="ltr">{STUDIO_INFO.licenseNumber}</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs opacity-70">
                  <p suppressHydrationWarning>
                    © {new Date().getFullYear()} {STUDIO_INFO.name} - جميع الحقوق محفوظة
                  </p>
                  <p className="flex items-center gap-2">
                    <span dir="ltr">{STUDIO_INFO.website.replace("https://", "")}</span>
                    <span>•</span>
                    <span dir="ltr">{STUDIO_INFO.phone}</span>
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-[#D4AF37]/20 text-center">
                  <p className="text-[10px] opacity-50">
                    هذا التقرير صادر إلكترونياً من نظام {STUDIO_INFO.name} وهو وثيقة معتمدة دون الحاجة لتوقيع أو ختم يدوي.
                    للاستفسار يرجى التواصل عبر القنوات الرسمية المذكورة أعلاه.
                  </p>
                </div>
              </div>

              <div className="h-2 bg-gradient-to-l from-[#D4AF37] via-[#f4e5b8] to-[#D4AF37]"></div>
            </div>
          </div>

          {/* تعليمات */}
          <div className="mt-6 p-4 bg-[#111] text-[#D4AF37] rounded-xl no-print">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Clock size={16} />
              اضغط على أي يوم لتحديده كمتاح أو غير متاح • الأيام الحمراء محجوزة ولا يمكن تعديلها • اضغط "طباعة التقرير" للحصول على نسخة احترافية بحجم A4
            </p>
          </div>
        </div>
      </div>
    </>
  )
}