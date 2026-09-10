"use client"

import { useState, useMemo } from "react"
import { ChevronRight, ChevronLeft, Calendar, Clock, User } from "lucide-react"

const MONTHS_AR = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"]
const DAYS_AR = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"]

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
}

interface BookedDate { date: string; client: string; status: string; timeSlot: string }

export default function ManagerCalendar({ artistName, bookedDates, availability }: {
  artistName: string; bookedDates: BookedDate[]; availability: any[]
}) {
  const [current, setCurrent] = useState(new Date())
  const [selected, setSelected] = useState<string | null>(null)

  const bookedMap = useMemo(() => {
    const m: Record<string, BookedDate[]> = {}
    bookedDates.forEach(b => { if (!m[b.date]) m[b.date] = []; m[b.date].push(b) })
    return m
  }, [bookedDates])

  const days = useMemo(() => {
    const y = current.getFullYear(), mo = current.getMonth()
    const first = new Date(y, mo, 1).getDay()
    const total = new Date(y, mo + 1, 0).getDate()
    const arr: (Date | null)[] = []
    for (let i = 0; i < first; i++) arr.push(null)
    for (let d = 1; d <= total; d++) arr.push(new Date(y, mo, d))
    return arr
  }, [current])

  const today = dateKey(new Date())
  const selectedBookings = selected ? bookedMap[selected] || [] : []

  return (
    <div className="print-area space-y-4">
      {/* Controls */}
      <div className="bg-[#111] rounded-2xl p-4 border border-[#F5A623]/20 no-print">
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth()-1, 1))} className="w-10 h-10 flex items-center justify-center bg-[#1a1a1a] hover:bg-[#222] rounded-lg transition">
            <ChevronRight size={20} className="text-[#F5A623]" />
          </button>
          <h2 className="text-xl font-black text-white">{MONTHS_AR[current.getMonth()]} {current.getFullYear()}</h2>
          <button onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth()+1, 1))} className="w-10 h-10 flex items-center justify-center bg-[#1a1a1a] hover:bg-[#222] rounded-lg transition">
            <ChevronLeft size={20} className="text-[#F5A623]" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap no-print">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gradient-to-br from-red-500 to-red-700"></div><span className="text-xs text-gray-400">محجوز</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gradient-to-br from-[#F5A623] to-[#E8961A]"></div><span className="text-xs text-gray-400">اليوم</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#1a1a1a] border border-[#F5A623]/20"></div><span className="text-xs text-gray-400">متاح</span></div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[#111] rounded-2xl border border-[#F5A623]/20 overflow-hidden">
        <div className="grid grid-cols-7">
          {DAYS_AR.map(d => (
            <div key={d} className="bg-[#0a0a0a] text-[#F5A623] text-center py-3 font-black text-sm border-b border-[#F5A623]/20">{d}</div>
          ))}
          {days.map((day, i) => {
            if (!day) return <div key={`e${i}`} className="aspect-square bg-[#0a0a0a]/50"></div>
            const key = dateKey(day)
            const isBooked = !!bookedMap[key]
            const isToday = key === today
            const isSelected = key === selected
            return (
              <button key={key} onClick={() => setSelected(isSelected ? null : key)}
                className={`aspect-square flex flex-col items-center justify-center relative transition-all border border-[#F5A623]/5
                  ${isBooked ? "bg-gradient-to-br from-red-500/20 to-red-700/10 hover:from-red-500/30" : "bg-[#1a1a1a] hover:bg-[#222]"}
                  ${isToday ? "ring-2 ring-[#F5A623] ring-inset" : ""}
                  ${isSelected ? "ring-2 ring-white ring-inset bg-[#222]" : ""}
                `}>
                <span className={`text-lg font-black ${isBooked ? "text-red-400" : isToday ? "text-[#F5A623]" : "text-gray-300"}`}>{day.getDate()}</span>
                {isBooked && <div className="absolute bottom-1 w-2 h-2 rounded-full bg-red-500"></div>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      {selected && (
        <div className="bg-[#111] rounded-2xl p-5 border border-[#F5A623]/20 no-print">
          <h3 className="font-black text-white mb-3 flex items-center gap-2">
            <Calendar size={18} className="text-[#F5A623]" />
            تفاصيل يوم {selected}
          </h3>
          {selectedBookings.length === 0 ? (
            <p className="text-gray-500 text-sm">لا توجد حجوزات في هذا اليوم — متاح للحجز</p>
          ) : (
            <div className="space-y-2">
              {selectedBookings.map((b, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-xl border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-red-400" />
                    <div>
                      <p className="font-bold text-white text-sm">{b.client}</p>
                      <p className="text-xs text-gray-400">{b.timeSlot || "—"}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 font-bold">{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bookings List */}
      <div className="bg-[#111] rounded-2xl p-5 border border-[#F5A623]/20">
        <h3 className="font-black text-white mb-3">📋 قائمة الحجوزات ({bookedDates.length})</h3>
        {bookedDates.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">لا توجد حجوزات</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {bookedDates.map((b, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-xl">
                <div className="flex items-center gap-3">
                  <Calendar size={14} className="text-[#F5A623]" />
                  <span className="text-sm text-white font-bold">{b.date}</span>
                  <span className="text-xs text-gray-400">{b.client}</span>
                </div>
                <span className="text-xs text-gray-500">{b.timeSlot || "—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}