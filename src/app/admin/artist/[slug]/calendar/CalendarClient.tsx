"use client"
import { useState, useMemo } from "react"
import { ChevronRight, ChevronLeft, Calendar, User } from "lucide-react"

const MONTHS = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"]
const DAYS = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"]
function dk(d: Date) { return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0") }

export default function CalendarClient({ artistName, bookedDates }: { artistName: string; bookedDates: {date:string;client:string;status:string;timeSlot:string}[] }) {
  const [cur, setCur] = useState(new Date())
  const [sel, setSel] = useState<string|null>(null)

  const bMap = useMemo(() => { const m: Record<string,typeof bookedDates> = {}; bookedDates.forEach(b => { if(!m[b.date])m[b.date]=[]; m[b.date].push(b) }); return m }, [bookedDates])

  const days = useMemo(() => {
    const y=cur.getFullYear(), mo=cur.getMonth(), f=new Date(y,mo,1).getDay(), t=new Date(y,mo+1,0).getDate()
    const a: (Date|null)[] = []; for(let i=0;i<f;i++) a.push(null); for(let d=1;d<=t;d++) a.push(new Date(y,mo,d)); return a
  }, [cur])

  const today = dk(new Date())
  const selBookings = sel ? bMap[sel]||[] : []

  return (
    <div className="print-area space-y-4">
      <div className="bg-[#111] rounded-2xl p-4 border border-[#D4AF37]/20 no-print">
        <div className="flex items-center justify-between">
          <button onClick={()=>setCur(new Date(cur.getFullYear(),cur.getMonth()-1,1))} className="w-10 h-10 flex items-center justify-center bg-[#1a1a1a] hover:bg-[#222] rounded-lg"><ChevronRight size={20} className="text-[#D4AF37]"/></button>
          <h2 className="text-xl font-black text-white">{MONTHS[cur.getMonth()]} {cur.getFullYear()}</h2>
          <button onClick={()=>setCur(new Date(cur.getFullYear(),cur.getMonth()+1,1))} className="w-10 h-10 flex items-center justify-center bg-[#1a1a1a] hover:bg-[#222] rounded-lg"><ChevronLeft size={20} className="text-[#D4AF37]"/></button>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap no-print">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-500"></div><span className="text-xs text-gray-400">محجوز</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#D4AF37]"></div><span className="text-xs text-gray-400">اليوم</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#1a1a1a] border border-[#D4AF37]/20"></div><span className="text-xs text-gray-400">متاح</span></div>
      </div>

      <div className="bg-[#111] rounded-2xl border border-[#D4AF37]/20 overflow-hidden">
        <div className="grid grid-cols-7">
          {DAYS.map(d=><div key={d} className="bg-[#0a0a0a] text-[#D4AF37] text-center py-3 font-black text-sm border-b border-[#D4AF37]/20">{d}</div>)}
          {days.map((day,i)=>{
            if(!day) return <div key={"e"+i} className="aspect-square bg-[#0a0a0a]/50"></div>
            const k=dk(day), ib=!!bMap[k], it=k===today, isel=k===sel
            return <button key={k} onClick={()=>setSel(isel?null:k)} className={"aspect-square flex flex-col items-center justify-center relative border border-[#D4AF37]/5 "+(ib?"bg-red-500/20 hover:bg-red-500/30":"bg-[#1a1a1a] hover:bg-[#222]")+(it?" ring-2 ring-[#D4AF37] ring-inset":"")+(isel?" ring-2 ring-white ring-inset":"")}>
              <span className={"text-lg font-black "+(ib?"text-red-400":it?"text-[#D4AF37]":"text-gray-300")}>{day.getDate()}</span>
              {ib && <div className="absolute bottom-1 w-2 h-2 rounded-full bg-red-500"></div>}
            </button>
          })}
        </div>
      </div>

      {sel && <div className="bg-[#111] rounded-2xl p-5 border border-[#D4AF37]/20 no-print">
        <h3 className="font-black text-white mb-3 flex items-center gap-2"><Calendar size={18} className="text-[#D4AF37]"/> تفاصيل {sel}</h3>
        {selBookings.length===0 ? <p className="text-gray-500 text-sm">متاح للحجز</p> : selBookings.map((b,i)=>(
          <div key={i} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-xl border border-red-500/20 mb-2">
            <div className="flex items-center gap-3"><User size={16} className="text-red-400"/><div><p className="font-bold text-white text-sm">{b.client}</p><p className="text-xs text-gray-400">{b.timeSlot||"—"}</p></div></div>
            <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 font-bold">{b.status}</span>
          </div>
        ))}
      </div>}

      <div className="bg-[#111] rounded-2xl p-5 border border-[#D4AF37]/20">
        <h3 className="font-black text-white mb-3">📋 الحجوزات ({bookedDates.length})</h3>
        {bookedDates.length===0 ? <p className="text-gray-500 text-center py-4">لا حجوزات</p> : (
          <div className="space-y-2 max-h-60 overflow-y-auto">{bookedDates.map((b,i)=>(
            <div key={i} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-xl">
              <div className="flex items-center gap-3"><Calendar size={14} className="text-[#D4AF37]"/><span className="text-sm text-white font-bold">{b.date}</span><span className="text-xs text-gray-400">{b.client}</span></div>
              <span className="text-xs text-gray-500">{b.timeSlot||"—"}</span>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  )
}