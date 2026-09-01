"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Plus, X, Calendar, Clock } from "lucide-react"

const DAYS = [
  { value: 0, label: "الأحد" },
  { value: 1, label: "الإثنين" },
  { value: 2, label: "الثلاثاء" },
  { value: 3, label: "الأربعاء" },
  { value: 4, label: "الخميس" },
  { value: 5, label: "الجمعة" },
  { value: 6, label: "السبت" },
]

export default function ArtistAvailabilityPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [artist, setArtist] = useState<any>(null)
  const [schedule, setSchedule] = useState<any[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchArtistAndSchedule()
  }, [slug])

  const fetchArtistAndSchedule = async () => {
    try {
      // جلب بيانات الفنان
      const artistRes = await fetch(`/api/admin/artists/${slug}`)
      const artistResult = await artistRes.json()

      if (artistResult.success) {
        setArtist(artistResult.data)
      }

      // جلب جدول التقويم
      const scheduleRes = await fetch(`/api/admin/artists/${slug}/availability`)
      const scheduleResult = await scheduleRes.json()

      if (scheduleResult.success && scheduleResult.data.length > 0) {
        setSchedule(scheduleResult.data)
      } else {
        // إنشاء جدول افتراضي (كل يوم من 9 صباحاً إلى 6 مساءً)
        const defaultSchedule = DAYS.map(day => ({
          dayOfWeek: day.value,
          dayLabel: day.label,
          startTime: "09:00",
          endTime: "18:00",
          isAvailable: true,
        }))
        setSchedule(defaultSchedule)
      }
    } catch (err) {
      setError("حدث خطأ أثناء تحميل البيانات")
    } finally {
      setLoading(false)
    }
  }

  const handleDayChange = (index: number, field: string, value: any) => {
    const newSchedule = [...schedule]
    newSchedule[index] = { ...newSchedule[index], [field]: value }
    setSchedule(newSchedule)
  }

  const addTimeSlot = (dayOfWeek: number) => {
    const newSchedule = [...schedule]
    newSchedule.push({
      dayOfWeek,
      dayLabel: DAYS[dayOfWeek].label,
      startTime: "09:00",
      endTime: "18:00",
      isAvailable: true,
    })
    setSchedule(newSchedule)
  }

  const removeTimeSlot = (index: number) => {
    const newSchedule = schedule.filter((_, i) => i !== index)
    setSchedule(newSchedule)
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch(`/api/admin/artists/${slug}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule }),
      })

      const result = await res.json()

      if (result.success) {
        setSuccess("تم حفظ جدول التقويم بنجاح!")
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
          <p className="text-gray-700 font-bold">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-purple-700 hover:text-purple-800 font-semibold mb-4 transition"
        >
          <ArrowLeft size={20} /> العودة
        </button>
        <h1 className="text-3xl font-black text-gray-900 mb-2">إدارة التقويم</h1>
        <p className="text-gray-500">تحديد أوقات العمل المتاحة للفنان {artist?.name}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-semibold">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold">
          {success}
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar size={24} className="text-purple-700" />
            جدول الأسبوع
          </h2>
        </div>

        {DAYS.map((day) => {
          const daySlots = schedule.filter(s => s.dayOfWeek === day.value)
          
          return (
            <div key={day.value} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">{day.label}</h3>
                <button
                  onClick={() => addTimeSlot(day.value)}
                  className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-200 transition"
                >
                  <Plus size={16} /> إضافة فترة
                </button>
              </div>

              {daySlots.length === 0 ? (
                <p className="text-gray-500 text-sm italic">لا توجد فترات محددة</p>
              ) : (
                <div className="space-y-2">
                  {daySlots.map((slot, index) => {
                    const actualIndex = schedule.findIndex(
                      s => s.dayOfWeek === day.value && 
                           s.startTime === slot.startTime && 
                           s.endTime === slot.endTime
                    )
                    
                    return (
                      <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                        <Clock size={16} className="text-gray-400" />
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => handleDayChange(actualIndex, "startTime", e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                        />
                        <span className="text-gray-500">إلى</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => handleDayChange(actualIndex, "endTime", e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                        />
                        <label className="flex items-center gap-2 mr-auto">
                          <input
                            type="checkbox"
                            checked={slot.isAvailable}
                            onChange={(e) => handleDayChange(actualIndex, "isAvailable", e.target.checked)}
                            className="w-4 h-4 text-purple-700 rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">متاح</span>
                        </label>
                        <button
                          onClick={() => removeTimeSlot(actualIndex)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {saving ? "جاري الحفظ..." : "حفظ الجدول"}
          </button>
        </div>
      </div>
    </div>
  )
}