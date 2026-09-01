import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Check, X, Award, Phone, Mail, MapPin, QrCode } from "lucide-react"

const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
]

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

// ✅ هذه صفحة عامة للتحقق - لا تحتاج تسجيل دخول
export default async function VerifyCalendarPage({
  params,
}: {
  params: Promise<{ artistId: string; year: string; month: string }>
}) {
  const { artistId, year: yearStr, month: monthStr } = await params

  const year = parseInt(yearStr)
  const month = parseInt(monthStr) - 1

  if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
    notFound()
  }

  // جلب بيانات الفنان
  let artist = await prisma.artist.findUnique({ where: { id: artistId } })
  if (!artist) {
    artist = await prisma.artist.findUnique({ where: { slug: artistId } })
  }

  if (!artist) {
    notFound()
  }

  // جلب جدول التوفر
  const availability = await prisma.availability.findMany({
    where: { artistId: artist.id, isAvailable: true },
  })

  // توليد الأيام المتاحة لهذا الشهر
  const availableDates = new Set<string>()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const dayOfWeek = date.getDay()
    const hasSlot = availability.some((s) => s.dayOfWeek === dayOfWeek)
    if (hasSlot) {
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      availableDates.add(key)
    }
  }

  // حساب الإحصائيات
  let availableCount = 0
  let unavailableCount = 0
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    if (availableDates.has(key)) availableCount++
    else unavailableCount++
  }

  const reportId = `CAL-${year}${String(month + 1).padStart(2, "0")}-${artist.id.slice(-6).toUpperCase()}`
  const todayKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`

  // توليد أيام التقويم
  const calendarDays: Array<{ date: Date | null; key: string | null }> = []
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push({ date: null, key: null })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    calendarDays.push({ date, key })
  }

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
            <p className="text-sm text-green-600">هذا التقرير صادر رسمياً من {STUDIO_INFO.name}</p>
          </div>
        </div>

        {/* التقرير */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-[#D4AF37] overflow-hidden">
          
          {/* الترويسة */}
          <div className="bg-gradient-to-l from-[#111] via-[#1a1a1a] to-[#111] text-[#D4AF37] relative overflow-hidden">
            <div className="h-2 bg-gradient-to-l from-[#D4AF37] via-[#f4e5b8] to-[#D4AF37]"></div>
            
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

          {/* معلومات الفنان */}
          <div className="bg-[#faf8f0] border-b-2 border-[#D4AF37]/30 px-6 md:px-8 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">الفنان</p>
                <p className="text-sm md:text-base font-bold text-gray-900 truncate">{artist.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">الفئة</p>
                <p className="text-sm md:text-base font-bold text-gray-900 truncate">{artist.category || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">أيام متاحة</p>
                <p className="text-lg md:text-xl font-black text-[#D4AF37]">{availableCount} يوم</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">أيام غير متاحة</p>
                <p className="text-lg md:text-xl font-black text-gray-900">{unavailableCount} يوم</p>
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
                <div key={day} className="bg-[#111] text-[#D4AF37] text-center py-2 font-black text-sm md:text-base rounded-lg">
                  {day}
                </div>
              ))}

              {calendarDays.map((item, idx) => {
                if (!item.date || !item.key) {
                  return <div key={`empty-${idx}`} className="aspect-square md:aspect-auto md:h-16"></div>
                }

                const isAvailable = availableDates.has(item.key)
                const isToday = item.key === todayKey

                return (
                  <div
                    key={item.key}
                    className={`
                      aspect-square md:aspect-auto md:h-16 rounded-lg font-bold relative
                      flex items-center justify-center
                      ${isToday ? "ring-2 ring-[#D4AF37]" : ""}
                      ${isAvailable
                        ? "bg-gradient-to-br from-[#D4AF37] to-[#b8941f] text-[#111] shadow-md"
                        : "bg-gradient-to-br from-[#111] to-[#333] text-white"
                      }
                    `}
                  >
                    <span className="text-base md:text-lg font-black">{item.date.getDate()}</span>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 pt-4 border-t-2 border-[#D4AF37]/20 flex items-center justify-center gap-6 flex-wrap relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-gradient-to-br from-[#D4AF37] to-[#b8941f]"></div>
                <span className="text-sm font-bold text-gray-700">يوم متاح للحجز</span>
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

          {/* قسم التوثيق */}
          <div className="bg-[#faf8f0] border-t-2 border-[#D4AF37]/30 px-6 md:px-8 py-5">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-xl border-2 border-[#111] shadow-lg">
                  <QrCode size={80} className="text-[#111]" />
                </div>
                <div className="text-xs md:text-sm text-gray-600 leading-relaxed">
                  <p className="flex items-center gap-2 font-bold text-gray-900 mb-1">
                    <QrCode size={16} className="text-[#D4AF37]" />
                    رمز التحقق
                  </p>
                  <p>هذا التقرير معتمد رسمياً</p>
                  <p className="font-mono text-xs mt-2 text-[#D4AF37] font-bold" dir="ltr">{reportId}</p>
                </div>
              </div>

              <div className="relative w-28 h-28 md:w-36 md:h-36" style={{ transform: "rotate(-8deg)" }}>
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

          {/* التذييل */}
          <div className="bg-gradient-to-l from-[#111] via-[#1a1a1a] to-[#111] text-[#D4AF37]">
            <div className="px-6 py-4 md:px-8 md:py-5">
              <div className="grid grid-cols-3 gap-4 mb-3 pb-3 border-b border-[#D4AF37]/30">
                <div>
                  <p className="text-xs opacity-70 mb-1">تاريخ الإصدار</p>
                  <p className="text-sm font-bold">
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
                <p>© {new Date().getFullYear()} {STUDIO_INFO.name} - جميع الحقوق محفوظة</p>
                <p className="flex items-center gap-2">
                  <span dir="ltr">{STUDIO_INFO.website.replace("https://", "")}</span>
                  <span>•</span>
                  <span dir="ltr">{STUDIO_INFO.phone}</span>
                </p>
              </div>
            </div>

            <div className="h-2 bg-gradient-to-l from-[#D4AF37] via-[#f4e5b8] to-[#D4AF37]"></div>
          </div>
        </div>
      </div>
    </div>
  )
}