"use client"
import { useState, useMemo } from "react"
import { ChevronRight, ChevronLeft, Calendar, User, Printer } from "lucide-react"

const MO = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"]
const DA = ["أحد","إثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت"]
function dk(d: Date) { return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0") }

interface BD { date:string; client:string; status:string; timeSlot:string; amount:number }

export default function CalendarClient({ artistName, bookedDates }: { artistName: string; bookedDates: BD[] }) {
  const [cur, setCur] = useState(new Date())
  const [sel, setSel] = useState<string|null>(null)

  const bMap = useMemo(() => { const m: Record<string,BD[]> = {}; bookedDates.forEach(b => { if(!m[b.date])m[b.date]=[]; m[b.date].push(b) }); return m }, [bookedDates])

  const days = useMemo(() => {
    const y=cur.getFullYear(), mo=cur.getMonth(), f=new Date(y,mo,1).getDay(), t=new Date(y,mo+1,0).getDate()
    const a: (Date|null)[] = []; for(let i=0;i<f;i++) a.push(null); for(let d=1;d<=t;d++) a.push(new Date(y,mo,d)); return a
  }, [cur])

  const today = dk(new Date())
  const selB = sel ? bMap[sel]||[] : []
  const monthB = bookedDates.filter(b => { const d=new Date(b.date); return d.getMonth()===cur.getMonth() && d.getFullYear()===cur.getFullYear() })

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="badge-gold mb-3">التقويم</div>
          <h1 className="text-4xl font-black text-gray-900">تقويم {artistName}</h1>
          <p className="text-gray-500 mt-1">{monthB.length} حجز في {MO[cur.getMonth()]}</p>
        </div>
        <button onClick={()=>window.print()} className="btn-gold"><Printer size={16}/> طباعة</button>
      </div>

      <div className="card-pro p-4 flex items-center justify-between">
        <button onClick={()=>setCur(new Date(cur.getFullYear(),cur.getMonth()-1,1))} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight size={20}/></button>
        <h2 className="text-xl font-black">{MO[cur.getMonth()]} {cur.getFullYear()}</h2>
        <button onClick={()=>setCur(new Date(cur.getFullYear(),cur.getMonth()+1,1))} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20}/></button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-500"></div><span className="text-xs text-gray-500">محجوز</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border-2 border-[#D4AF37]"></div><span className="text-xs text-gray-500">اليوم</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gray-50 border border-gray-200"></div><span className="text-xs text-gray-500">متاح</span></div>
      </div>

      <div className="card-pro overflow-hidden print-area">
        <div className="grid grid-cols-7">
          {DA.map(d=><div key={d} className="bg-[#111] text-[#D4AF37] text-center py-3 font-black text-sm">{d}</div>)}
          {days.map((day,i)=>{
            if(!day) return <div key={"e"+i} className="aspect-square bg-gray-50"></div>
            const k=dk(day), ib=!!bMap[k], it=k===today, isel=k===sel
            return <button key={k} onClick={()=>setSel(isel?null:k)} className={"aspect-square flex flex-col items-center justify-center relative border border-gray-100 transition-all hover:bg-gray-50 "+(ib?"bg-red-50":"bg-white")+(it?" ring-2 ring-[#D4AF37] ring-inset":"")+(isel?" ring-2 ring-[#111] ring-inset":"")}>
              <span className={"text-lg font-black "+(ib?"text-red-600":it?"text-[#b8941f]":"text-gray-700")}>{day.getDate()}</span>
              {ib && <div className="absolute bottom-1 w-2 h-2 rounded-full bg-red-500"></div>}
            </button>
          })}
        </div>
      </div>

      {sel && <div className="card-pro p-5">
        <h3 className="font-black text-gray-900 mb-3 flex items-center gap-2"><Calendar size={18} className="text-[#b8941f]"/> تفاصيل {sel}</h3>
        {selB.length===0 ? <p className="text-gray-500 text-sm">متاح للحجز ✅</p> : selB.map((b,i)=>(
          <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-200 mb-2">
            <div className="flex items-center gap-3"><User size={16} className="text-red-500"/><div><p className="font-bold text-gray-900 text-sm">{b.client}</p><p className="text-xs text-gray-500">{b.timeSlot}</p></div></div>
            <div className="text-left"><p className="font-bold text-[#b8941f] text-sm">{b.amount.toLocaleString()} ج.م</p><span className="text-xs text-red-600">{b.status}</span></div>
          </div>
        ))}
      </div>}

      <div className="card-pro p-5">
        <h3 className="font-black text-gray-900 mb-3">حجوزات {MO[cur.getMonth()]} ({monthB.length})</h3>
        {monthB.length===0 ? <p className="text-gray-500 text-center py-4">لا حجوزات</p> : (
          <div className="space-y-2 max-h-64 overflow-y-auto">{monthB.map((b,i)=>(
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3"><Calendar size={14} className="text-[#b8941f]"/><span className="text-sm font-bold text-gray-900">{b.date}</span><span className="text-xs text-gray-500">{b.client}</span></div>
              <span className="text-sm font-bold text-[#b8941f]">{b.amount.toLocaleString()} ج.م</span>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  )
}