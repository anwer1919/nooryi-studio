"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Check, Award, Phone, Mail, MapPin, Shield, Loader2, AlertTriangle } from "lucide-react"

const DAYS_SHORT_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

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

export default function VerifyCalendarPage() {
  const params = useParams()

  const artistId = params.artistId as string
  const year = params.year as string
  const month = params.month as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetchVerifyData()
  }, [artistId, year, month])

  const fetchVerifyData = async () => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`/api/verify/${artistId}/${year}/${month}`, {
        cache: "no-store",
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        setError(result.error || "فشل في التحقق من التقرير")
        return
      }

      setData(result.data)
    } catch (err: any) {
      setError(err?.message || "حدث خطأ أثناء الاتصال بالخادم")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader2 className="w-14 h-14 text-[#D4AF37] animate-spin mx-auto mb-4" />
          <p className="text-white font-bold">جاري التحقق من التقرير...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-lg w-full bg-white border-2 border-red-200 rounded-2xl p-6 text-center shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">تعذر التحقق من التقرير</h1>
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            تأكد أن رابط QR صحيح وأن التقرير صادر من النظام.
          </p>
        </div>
      </div>
    )
  }

  const artist = data.artist
  const reportId = data.reportId

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8" dir="rtl">
      <div className="max-w-5xl mx-auto">

        {/* رسالة التحقق */}
        <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <Check size={24} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-green-800">تقرير معتمد ✓</p>
            <p className="text-sm text-green-600">
              تم التحقق من التقرير بنجاح وهو صادر رسمياً من {STUDIO_INFO.name}
            </p>
          </div>
        </div>

        {/* التقرير */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-[#D4AF37] overflow-hidden">

          {/* الترويسة */}
          <div className="bg-gradient-to-l from-[#111] via-[#1a1a1a] to-[#111] text-[#D4AF37] relative overflow-hidden">
            <div className="h-2 bg-gradient-to-l from-[#D4AF37] via-[#f4e5b8] to-[#D4AF37]" />

            <div className="p-6 md:p-8 relative">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center shadow-2xl border-4 border-[#D4AF37]/50">
                    <span className="text-[#111] text-3xl md:text-4xl font-black">N</span>
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-wide">{STUDIO_INFO.name}</h1>
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
                  <h2 className="text-xl md:text-2xl font-black">تقرير التقويم الشهري</h2>
                  <p className="text-lg md:text-xl opacity-90">
                    {data.monthName} {data.year}
                  </p>
                </div>

                <div className="text-left">
                  <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/40 rounded-lg px-4 py-2 inline-block">
                    <p className="text-[10px] opacity-70 mb-1">رقم التقرير</p>
                    <p className="text-base md:text-lg font-black font-mono" dir="ltr">
                      {reportId}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* معلومات الفنان */}
          <div className="bg-[#faf8f0] border-b-2 border-[#D4AF37]/30 px-6 md:px-8 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">الفنان</p>
                <p className="text-sm md:text-base font-bold text-gray-900 truncate">
                  {artist.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">الفئة</p>
                <p className="text-sm md:text-base font-bold text-gray-900 truncate">
                  {artist.category || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">أيام متاحة</p>
                <p className="text-lg md:text-xl font-black text-[#D4AF37]">
                  {data.availableCount} يوم
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">أيام غير متاحة</p>
                <p className="text-lg md:text-xl font-black text-gray-900">
                  {data.unavailableCount} يوم
                </p>
              </div>
            </div>
          </div>

          {/* جدول التقويم */}
          <div className="p-4 md:p-6 relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
              <span className="text-8xl font-black text-[#111] rotate-[-30deg]">
                {STUDIO_INFO.name}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2 relative z-10">
              {DAYS_SHORT_AR.map((day) => (
                <div
                  key={day}
                  className="bg-[#111] text-[#D4AF37] text-center py-2 font-black text-sm md:text-base rounded-lg"
                >
                  {day}
                </div>
              ))}

              {data.days.map((item: any, idx: number) => {
                if (!item.day || !item.key) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="aspect-square md:aspect-auto md:h-16"
                    />
                  )
                }

                return (
                  <div
                    key={item.key}
                    className={`
                      aspect-square md:aspect-auto md:h-16 rounded-lg font-bold relative
                      flex items-center justify-center
                      ${
                        item.isAvailable
                          ? "bg-gradient-to-br from-[#D4AF37] to-[#b8941f] text-[#111] shadow-md"
                          : "bg-gradient-to-br from-[#111] to-[#333] text-white"
                      }
                    `}
                  >
                    <span className="text-base md:text-lg font-black">
                      {item.day}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 pt-4 border-t-2 border-[#D4AF37]/20 flex items-center justify-center gap-6 flex-wrap relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-gradient-to-br from-[#D4AF37] to-[#b8941f]" />
                <span className="text-sm font-bold text-gray-700">يوم متاح للحجز</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-gradient-to-br from-[#111] to-[#333]" />
                <span className="text-sm font-bold text-gray-700">يوم غير متاح</span>
              </div>
            </div>
          </div>

          {/* التوثيق */}
          <div className="bg-[#faf8f0] border-t-2 border-[#D4AF37]/30 px-6 md:px-8 py-5">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-xl border-2 border-[#111] shadow-lg">
                  <Shield size={80} className="text-[#111]" />
                </div>
                <div className="text-xs md:text-sm text-gray-600 leading-relaxed">
                  <p className="flex items-center gap-2 font-bold text-gray-900 mb-1">
                    <Shield size={16} className="text-[#D4AF37]" />
                    رمز التحقق
                  </p>
                  <p>هذا التقرير معتمد رسمياً</p>
                  <p className="font-mono text-xs mt-2 text-[#D4AF37] font-bold" dir="ltr">
                    {reportId}
                  </p>
                </div>
              </div>

              <div
                className="relative w-28 h-28 md:w-36 md:h-36"
                style={{ transform: "rotate(-8deg)" }}
              >
                <div className="absolute inset-0 rounded-full border-4 border-[#D4AF37] flex items-center justify-center">
                  <div className="absolute inset-2 rounded-full border-2 border-[#D4AF37]" />
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
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[#D4AF37] text-xs">
                  ★ ★ ★
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[#D4AF37] text-xs">
                  ★ ★ ★
                </div>
              </div>
            </div>
          </div>

          {/* التذييل */}
          <div className="bg-gradient-to-l from-[#111] via-[#1a1a1a] to-[#111] text-[#D4AF37]">
            <div className="px-6 py-4 md:px-8 md:py-5">
              <div className="grid grid-cols-3 gap-4 mb-3 pb-3 border-b border-[#D4AF37]/30">
                <div>
                  <p className="text-xs opacity-70 mb-1">رقم التقرير</p>
                  <p className="text-sm font-bold font-mono" dir="ltr">
                    {reportId}
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-70 mb-1">الترخيص</p>
                  <p className="text-sm font-bold" dir="ltr">
                    {STUDIO_INFO.licenseNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-70 mb-1">الموقع</p>
                  <p className="text-sm font-bold" dir="ltr">
                    {STUDIO_INFO.website.replace("https://", "")}
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs opacity-70">
                <p>© {STUDIO_INFO.name} - جميع الحقوق محفوظة</p>
                <p className="flex items-center gap-2">
                  <span dir="ltr">{STUDIO_INFO.phone}</span>
                </p>
              </div>
            </div>

            <div className="h-2 bg-gradient-to-l from-[#D4AF37] via-[#f4e5b8] to-[#D4AF37]" />
          </div>
        </div>
      </div>
    </div>
  )
}