"use client"
import { useState, useMemo } from "react"
import { ChevronRight, ChevronLeft, Calendar, User, Printer, Clock, DollarSign } from "lucide-react"

const MO = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"]
const DA = ["أحد","إثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت"]
function dk(d:Date){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}

interface BD{date:string;client:string;status:string;timeSlot:string;amount:number}

export default function ManagerCalClient({artistName,artistSlug,bookedDates}:{artistName:string;artistSlug:string;bookedDates:BD[]}){
  const [cur,setCur]=useState(new Date())
  const [sel,setSel]=useState<string|null>(null)

  const bMap=useMemo(()=>{const m:Record<string,BD[]>={};bookedDates.forEach(b=>{if(!m[b.date])m[b.date]=[];m[b.date].push(b)});return m},[bookedDates])
  const days=useMemo(()=>{const y=cur.getFullYear(),mo=cur.getMonth(),f=new Date(y,mo,1).getDay(),t=new Date(y,mo+1,0).getDate();const a:(Date|null)[]=[];for(let i=0;i<f;i++)a.push(null);for(let d=1;d<=t;d++)a.push(new Date(y,mo,d));return a},[cur])
  const today=dk(new Date())
  const selB=sel?bMap[sel]||[]:[]
  const monthB=bookedDates.filter(b=>{const d=new Date(b.date);return d.getMonth()===cur.getMonth()&&d.getFullYear()===cur.getFullYear()})
  const totalRev=monthB.reduce((s,b)=>s+b.amount,0)

  const handlePrint=()=>{
    const el=document.getElementById("cal-print")
    if(!el)return
    const win=window.open("","_blank","width=900,height=700")
    if(!win){alert("اسمح بالنوافذ المنبثقة");return}
    win.document.write('<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>تقويم '+artistName+'</title><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}body{font-family:Cairo,sans-serif;background:#fff;color:#000;padding:10mm;direction:rtl}@page{margin:10mm;size:A4 landscape}.hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:15px;border-bottom:3px solid #D4AF37}.hdr h1{font-size:28px;font-weight:900}.hdr .gold{color:#D4AF37}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#0a0a0a;color:#D4AF37;padding:8px;text-align:center;font-weight:700}td{padding:8px;border-bottom:1px solid #ddd;text-align:center}.bold{font-weight:700}.gold{color:#D4AF37;font-weight:900}.foot{margin-top:20px;padding-top:15px;border-top:2px solid #D4AF37;text-align:center;font-size:10px;color:#888}</style></head><body>'+el.innerHTML+'</body></html>')
    win.document.close()
    setTimeout(()=>win.print(),600)
  }

  return(
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><div className="badge-gold mb-3">التقويم</div><h1 className="text-3xl font-black text-white flex items-center gap-2"><Calendar size={28} className="text-[#D4AF37]"/> تقويم {artistName}</h1><p className="text-gray-400 text-sm mt-1">{monthB.length} حجز في {MO[cur.getMonth()]}</p></div>
        <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#0a0a0a] rounded-xl font-black text-sm hover:shadow-lg transition"><Printer size={16}/> طباعة</button>
      </div>

      <div className="bg-[#111] rounded-2xl p-4 border border-[#D4AF37]/20 flex items-center justify-between">
        <button onClick={()=>setCur(new Date(cur.getFullYear(),cur.getMonth()-1,1))} className="p-2 hover:bg-[#1a1a1a] rounded-lg"><ChevronRight size={20} className="text-[#D4AF37]"/></button>
        <h2 className="text-xl font-black text-white">{MO[cur.getMonth()]} {cur.getFullYear()}</h2>
        <button onClick={()=>setCur(new Date(cur.getFullYear(),cur.getMonth()+1,1))} className="p-2 hover:bg-[#1a1a1a] rounded-lg"><ChevronLeft size={20} className="text-[#D4AF37]"/></button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-500"></div><span className="text-xs text-gray-400">محجوز</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#D4AF37]"></div><span className="text-xs text-gray-400">اليوم</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#1a1a1a] border border-[#D4AF37]/20"></div><span className="text-xs text-gray-400">متاح</span></div>
      </div>

      <div className="bg-[#111] rounded-2xl border border-[#D4AF37]/20 overflow-hidden">
        <div className="grid grid-cols-7">
          {DA.map(d=><div key={d} className="bg-[#0a0a0a] text-[#D4AF37] text-center py-3 font-black text-sm border-b border-[#D4AF37]/20">{d}</div>)}
          {days.map((day,i)=>{
            if(!day)return<div key={"e"+i} className="aspect-square bg-[#0a0a0a]/50"></div>
            const k=dk(day),ib=!!bMap[k],it=k===today,isel=k===sel
            return<button key={k} onClick={()=>setSel(isel?null:k)} className={"aspect-square flex flex-col items-center justify-center relative border border-[#D4AF37]/5 transition-all "+(ib?"bg-red-500/20 hover:bg-red-500/30":"bg-[#1a1a1a] hover:bg-[#222]")+(it?" ring-2 ring-[#D4AF37] ring-inset":"")+(isel?" ring-2 ring-white ring-inset":"")}>
              <span className={"text-lg font-black "+(ib?"text-red-400":it?"text-[#D4AF37]":"text-gray-300")}>{day.getDate()}</span>
              {ib&&<div className="absolute bottom-1 w-2 h-2 rounded-full bg-red-500"></div>}
            </button>
          })}
        </div>
      </div>

      {sel&&<div className="bg-[#111] rounded-2xl p-5 border border-[#D4AF37]/20">
        <h3 className="font-black text-white mb-3 flex items-center gap-2"><Calendar size={18} className="text-[#D4AF37]"/> تفاصيل {sel}</h3>
        {selB.length===0?<p className="text-gray-500 text-sm">متاح للحجز ✅</p>:selB.map((b,i)=>(
          <div key={i} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-xl border border-red-500/20 mb-2">
            <div className="flex items-center gap-3"><User size={16} className="text-red-400"/><div><p className="font-bold text-white text-sm">{b.client}</p><p className="text-xs text-gray-400">{b.timeSlot}</p></div></div>
            <div className="text-left"><p className="font-bold text-[#D4AF37] text-sm">{b.amount.toLocaleString()} ج.م</p><span className="text-xs text-red-400">{b.status}</span></div>
          </div>
        ))}
      </div>}

      {/* منطقة الطباعة المخفية */}
      <div id="cal-print" className="hidden">
        <div className="hdr"><div><h1>Nooryi <span className="gold">Studio</span></h1><p>تقويم الحجوزات — {artistName} — {MO[cur.getMonth()]} {cur.getFullYear()}</p></div><div style={{textAlign:"left"}}><p className="gold" style={{fontSize:"18px",fontWeight:900}}>{monthB.length} حجز</p><p>إيرادات: <span className="gold">{totalRev.toLocaleString()} ج.م</span></p></div></div>
        {monthB.length===0?<p style={{textAlign:"center",padding:"40px",color:"#888"}}>لا توجد حجوزات</p>:
        <table><thead><tr><th>#</th><th>التاريخ</th><th>اليوم</th><th>الوقت</th><th>العميل</th><th>المبلغ</th><th>الحالة</th></tr></thead><tbody>
          {monthB.map((b,i)=><tr key={i}><td>{i+1}</td><td className="bold">{new Date(b.date).toLocaleDateString("ar-EG")}</td><td>{new Date(b.date).toLocaleDateString("ar-EG",{weekday:"short"})}</td><td>{b.timeSlot||"—"}</td><td className="bold">{b.client}</td><td className="gold">{b.amount.toLocaleString()} ج.م</td><td>{b.status}</td></tr>)}
        </tbody><tfoot><tr style={{background:"#0a0a0a",color:"#D4AF37",fontWeight:900}}><td colSpan={5} style={{textAlign:"right",padding:"8px"}}>الإجمالي</td><td className="gold" style={{padding:"8px"}}>{totalRev.toLocaleString()} ج.م</td><td></td></tr></tfoot></table>}
        <div className="foot">Nooryi Studio — تقرير تقويم صادر تلقائياً — {new Date().toLocaleDateString("ar-EG")}</div>
      </div>
    </div>
  )
}