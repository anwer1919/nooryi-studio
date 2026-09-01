"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Calendar, Check, X } from "lucide-react"

const DAYS = [
  { value: 0, label: "الأحد", short: "أحد" },
  { value: 1, label: "الإثنين", short: "إثنين" },
  { value: 2, label: "الثلاثاء", short: "ثلاثاء" },
  { value: 3, label: "الأربعاء", short: "أربعاء" },
  { value: 4, label: "الخميس", short: "خميس" },
  { value: 5, label: "الجمعة", short: "جمعة" },
  { value: 6, label: "السبت", short: "سبت" },
]

// الساعات من 8 صباحاً إلى 12 منتصف الليل
const HOURS = Array.from({ length: 16 }, (_, i) => {
  const hour = i + 8
  return {
    value: hour,
    label: hour < 12 ? `${hour} ص` : hour === 12 ? "12 ظ" : `${hour - 12} م`,
  }
})

export default function ArtistAvailabilityPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [artist, setArtist] = useState<any>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // التقويم: كائن يحتوي على الأوقات المتاحة
  // المفتاح: "dayOfWeek-hour" مثال: "0-9" يعني الأحد الساعة 9
  const [availableSlots, setAvailableSlots] = useState<Set<string>>(new Set())
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState<"add" | "remove">("add")

  useEffect(() => {
    fetchData()
  }, [slug])

  const fetchData = async () => {
    try {
      const artistRes = await fetch(`/api/admin/artists/${slug}`)
      const artistResult = await artistRes.json()
      if (artistResult.success) setArtist(artistResult.data)

      const scheduleRes = await fetch(`/api/admin/artists/${slug}/availability`)
      const scheduleResult = await scheduleRes.json()

      if (scheduleResult.success && scheduleResult.data) {
        const slots = new Set<string>()
        scheduleResult.data.forEach((item: any) => {
          if (item.isAvailable) {
            const startHour = parseInt(item.startTime.split(":")[0])
            const endHour = parseInt(item.endTime.split(":")[0])
            for (let h = startHour; h < endHour; h++) {
              slots.add(`${item.dayOfWeek}-${h}`)
            }
          }
        })
        setAvailableSlots(slots)
      } else {
        // جدول افتراضي: كل يوم من 9 صباحاً إلى 6 مساءً
        const defaultSlots = new Set<string>()
        DAYS.forEach(day => {
          for (let h = 9; h < 18; h++) {
            defaultSlots.add(`${day.value}-${h}`)
          }
        })
        setAvailableSlots(defaultSlots)
      }
    } catch (err) {
      setError("حدث خطأ أثناء تحميل البيانات")
    } finally {
      setLoading(false)
    }
  }

  const toggleSlot = useCallback((dayOfWeek: number, hour: number) => {
    const key = `${dayOfWeek}-${hour}`
    setAvailableSlots(prev => {
      const newSlots = new Set(prev)
      if (dragMode === "add") {
        newSlots.add(key)
      } else {
        newSlots.delete(key)
      }
      return newSlots
    })
  }, [dragMode])

  const handleMouseDown = (dayOfWeek: number, hour: number) => {
    const key = `${dayOfWeek}-${hour}`
    const isCurrentlyAvailable = availableSlots.has(key)
    setDragMode(isCurrentlyAvailable ? "remove" : "add")
    setIsDragging(true)
    toggleSlot(dayOfWeek, hour)
  }

  const handleMouseEnter = (dayOfWeek: number, hour: number) => {
    if (isDragging) {
      toggleSlot(dayOfWeek, hour)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp)
    return () => window.removeEventListener("mouseup", handleMouseUp)
  }, [])

  // تحديد كل ساعات يوم معين
  const selectWholeDay = (dayOfWeek: number) => {
    setAvailableSlots(prev => {
      const newSlots = new Set(prev)
      const dayHours = HOURS.map(h => `${dayOfWeek}-${h.value}`)
      const allSelected = dayHours.every(key => newSlots.has(key))
      
      dayHours.forEach(key => {
        if (allSelected) {
          newSlots.delete(key)
        } else {
          newSlots.add(key)
        }
      })
      return newSlots
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      // تحويل الأوقات المتاحة إلى فترات زمنية
      const schedule: any[] = []
      
      DAYS.forEach(day => {
        const daySlots = HOURS
          .filter(h => availableSlots.has(`${day.value}-${h.value}`))
          .map(h => h.value)
          .sort((a, b) => a - b)

        if (daySlots.length === 0) return

        // تجميع الساعات المتتالية في فترات
        let start = daySlots[0]
        let end = daySlots[0] + 1

        for (let i = 1; i < daySlots.length; i++) {
          if (daySlots[i] === end) {
            end = daySlots[i] + 1
          } else {
            schedule.push({
              dayOfWeek: day.value,
              startTime: `${String(start).padStart(2, "0")}:00`,
              endTime: `${String(end).padStart(2, "0")}:00`,
              isAvailable: true,
            })
            start = daySlots[i]
            end = daySlots[i] + 1
          }
        }
        
        schedule.push({
          dayOfWeek: day.value,
          startTime: `${String(start).padStart(2, "0")}:00`,
          endTime: `${String(end).padStart(2, "0")}:00`,
          isAvailable: true,
        })
      })

      const res = await fetch(`/api/admin/artists/${slug}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule }),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-bold">جاري تحميل التقويم...</p>
        </div>
      </div>
    )
  }

  const totalAvailable = availableSlots.size
  const totalHours = DAYS.length * HOURS.length
  const availabilityPercentage = Math.round((totalAvailable / totalHours) * 100)

  return (
    <div className="max-w-7xl mx-auto" onMouseLeave={() => setIsDragging(false)}>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-purple-700 hover:text-purple-800 font-semibold mb-4 transition"
        >
          <ArrowLeft size={20} /> العودة
        </button>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
              <Calendar size={32} className="text-purple-700" />
              تقويم التوفر
            </h1>
            <p className="text-gray-500">
              حدد الأوقات المتاحة للحجز للفنان <span className="font-bold text-purple-700">{artist?.name}</span>
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-3 rounded-xl">
            <p className="text-sm opacity-80">نسبة التوفر</p>
            <p className="text-2xl font-black">{availabilityPercentage}%</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-semibold flex items-center gap-2">
          <X size={20} /> {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold flex items-center gap-2">
          <Check size={20} /> {success}
        </div>
      )}

      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-blue-800 text-sm font-semibold">
          💡 <span className="font-bold">كيفية الاستخدام:</span> اضغط واسحب على الخلايا لتحديد أو إلغاء الأوقات المتاحة. 
          اضغط على اسم اليوم لتحديد اليوم بالكامل.
        </p>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse select-none">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-3 text-sm font-bold text-gray-500 w-20 border-l border-gray-200">
                  الوقت
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day.value}
                    onClick={() => selectWholeDay(day.value)}
                    className="p-3 text-sm font-bold text-gray-900 cursor-pointer hover:bg-purple-50 transition border-l border-gray-200 last:border-l-0"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-base">{day.label}</span>
                      <span className="text-xs text-gray-400 font-normal">اضغط للتحديد</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour.value} className="border-b border-gray-100 last:border-b-0">
                  <td className="p-2 text-sm font-semibold text-gray-600 text-center bg-gray-50 border-l border-gray-200">
                    {hour.label}
                  </td>
                  {DAYS.map((day) => {
                    const key = `${day.value}-${hour.value}`
                    const isAvailable = availableSlots.has(key)
                    return (
                      <td
                        key={key}
                        onMouseDown={() => handleMouseDown(day.value, hour.value)}
                        onMouseEnter={() => handleMouseEnter(day.value, hour.value)}
                        className={`
                          p-0 h-12 cursor-pointer transition-all duration-150 border-l border-gray-100 last:border-l-0
                          ${isAvailable 
                            ? "bg-green-100 hover:bg-green-200" 
                            : "bg-gray-100 hover:bg-gray-200"
                          }
                        `}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          {isAvailable && (
                            <Check size={16} className="text-green-600" />
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 border border-green-300 rounded"></div>
          <span className="text-sm text-gray-600 font-medium">متاح للحجز</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded"></div>
          <span className="text-sm text-gray-600 font-medium">غير متاح</span>
        </div>
        <div className="mr-auto text-sm text-gray-500">
          إجمالي الساعات المتاحة: <span className="font-bold text-purple-700">{totalAvailable}</span> ساعة أسبوعياً
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-4">
        <button
          onClick={() => router.back()}
          className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition"
        >
          إلغاء
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={20} />
          {saving ? "جاري الحفظ..." : "حفظ التقويم"}
        </button>
      </div>
    </div>
  )
}