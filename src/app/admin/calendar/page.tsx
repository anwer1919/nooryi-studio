"use client"

import { useState, useEffect } from "react"
import { Calendar, Loader2, AlertCircle, Check, ChevronLeft, ChevronRight } from "lucide-react"

const DAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

export default function AdminCalendarPage() {
  const [artists, setArtists] = useState<any[]>([])
  const [selectedArtist, setSelectedArtist] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [currentDate, setCurrentDate] = useState(new Date())
  const [availability, setAvailability] = useState<any[]>([])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => {
    fetchArtists()
  }, [])

  useEffect(() => {
    if (selectedArtist) {
      fetchAvailability()
    }
  }, [selectedArtist, year, month])

  // ✅ التعامل الآمن مع استجابة API الفنانين
  const fetchArtists = async () => {
    try {
      const res = await fetch("/api/admin/artists")
      if (!res.ok) throw new Error("Failed to fetch artists")
      const data = await res.json()
      
      const artistsArray = Array.isArray(data) 
        ? data 
        : (data.artists || data.data || [])
      
      setArtists(artistsArray)
    } catch (err) {
      console.error("Error fetching artists:", err)
      setArtists([])
    }
  }

  // ✅ التعامل الآمن مع استجابة API التقويم
  const fetchAvailability = async () => {
    setLoading(true)
    try {
      const artist = artists.find(a => a.id === selectedArtist)
      if (!artist) return

      const res = await fetch(`/api/admin/artists/${artist.slug}/availability?year=${year}&month=${month + 1}`)
      if (!res.ok) throw new Error("Failed to fetch availability")
      const data = await res.json()
      
      const availabilityArray = Array.isArray(data)
        ? data
        : (data.availability || data.data || [])
      
      setAvailability(availabilityArray)
    } catch (err) {
      console.error("Error fetching availability:", err)
      setAvailability([])
    } finally {
      setLoading(false)
    }
  }

  const toggleDay = async (day: number) => {
    const artist = artists.find(a => a.id === selectedArtist)
    if (!artist) return

    const dayOfWeek = new Date(year, month, day).getDay()
    const existing = availability.find(a => {
      const aDate = new Date(a.date)
      return aDate.getDate() === day && aDate.getMonth() === month
    })

    setSaving(true)
    try {
      if (existing) {
        await fetch(`/api/admin/artists/${artist.slug}/availability/${existing.id}`, {
          method: "DELETE",
        })
      } else {
        await fetch(`/api/admin/artists/${artist.slug}/availability`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dayOfWeek,
            startTime: "09:00",
            endTime: "18:00",
            isAvailable: true,
          }),
        })
      }
      await fetchAvailability()
      setMessage({ type: "success", text: "تم التحديث بنجاح" })
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage({ type: "error", text: "فشل التحديث" })
    } finally {
      setSaving(false)
    }
  }

  const isDayAvailable = (day: number) => {
    return availability.some(a => {
      const aDate = new Date(a.date)
      return aDate.getDate() === day && aDate.getMonth() === month
    })
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const monthNames = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ]

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <Calendar className="text-purple-700" size={32} />
          إدارة التقويم
        </h1>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-2 ${
          message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {message.type === "success" ? <Check size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            اختر الفنان
          </label>
          <select
            value={selectedArtist}
            onChange={(e) => setSelectedArtist(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">-- اختر فنان --</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>
                {artist.name}
              </option>
            ))}
          </select>
        </div>

        {selectedArtist && (
          <>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronRight size={24} />
              </button>
              <h2 className="text-2xl font-black text-gray-900">
                {monthNames[month]} {year}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronLeft size={24} />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-purple-700" size={32} />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {DAYS_AR.map((day) => (
                  <div
                    key={day}
                    className="text-center font-bold text-gray-700 py-2 bg-gray-50 rounded-lg text-sm"
                  >
                    {day}
                  </div>
                ))}

                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const available = isDayAvailable(day)

                  return (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      disabled={saving}
                      className={`
                        aspect-square rounded-lg font-bold text-lg transition-all
                        ${available
                          ? "bg-green-500 text-white hover:bg-green-600 shadow-lg"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }
                        disabled:opacity-50
                      `}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            )}

            <div className="mt-6 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded" />
                <span className="text-sm font-bold">يوم متاح</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-100 rounded" />
                <span className="text-sm font-bold">يوم غير متاح</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}