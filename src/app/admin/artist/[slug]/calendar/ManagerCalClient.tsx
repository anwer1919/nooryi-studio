"use client"
import { useState, useMemo } from "react"
import { ChevronRight, ChevronLeft, Calendar, User, Printer } from "lucide-react"

const MO=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"]
const DA=["أحد","إثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت"]
function dk(d:Date){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
interface BD{date:string;client:string;status:string;timeSlot:string;amount:number}
const S={name:"Nooryi Studio",ar:"استوديو نوري",tag:"STUDIO FOR ARTISTS & EVENTS",reg:"123456789",tax:"300000000000003",web:"https://nooryi-studio.vercel.app"}

export default function ManagerCalClient({artistName,artistSlug,bookedDates}:{artistName:string;artistSlug:string;bookedDates:BD[]}){
  const [cur,setCur]=useState(new Date())
  const [sel,setSel]=useState<string|null>(null)
  const bMap=useMemo(()=>{const m:Record<string,BD[]>={};bookedDates.forEach(b=>{if(!m[b.date])m[b.date]=[];m[b.date].push(b)});return m},[bookedDates])
  const days=useMemo(()=>{const y=cur.getFullYear(),mo=cur.getMonth(),f=new Date(y,mo,1).getDay(),t=new Date(y,mo+1,0).getDate();const a:(Date|null)[]=[];for(let i=0;i<f;i++)a.push(null);for(let d=1;d<=t;d++)a.push(new Date(y,mo,d));return a},[cur])
  const today=dk(new Date());const selB=sel?bMap[sel]||[]:[]
  const monthB=bookedDates.filter(b=>{const d=new Date(b.date);return d.getMonth()===cur.getMonth()&&d.getFullYear()===cur.getFullYear()})
  const totalRev=monthB.reduce((s,b)=>s+b.amount,0)
  const rn="CAL-"+artistSlug.toUpperCase().slice(0,6)+"-"+Date.now().toString(36).toUpperCase()
  const rd=new Date().toLocaleDateString("ar-EG",{year:"numeric",month:"long",day:"numeric"})
  const vu=S.web+"/verify/calendar/"+artistSlug+"?report="+rn

  const rows=monthB.map((b,i)=>'<tr><td class="mono">'+String(i+1).padStart(2,'0')+'</td><td class="bold">'+new Date(b.date).toLocaleDateString("ar-EG")+'</td><td style="text-align:center">'+new Date(b.date).toLocaleDateString("ar-EG",{weekday:"short"})+'</td><td style="text-align:center">'+(b.timeSlot||"—")+'</td><td class="bold">'+b.client+'</td><td class="gold">'+b.amount.toLocaleString()+' ج.م</td><td style="text-align:center">'+b.status+'</td></tr>').join("")

  const printHTML='<div class="page">'+
    '<div class="hdr"><div class="hdr-flex"><div><h1>Nooryi</h1><div class="gold-line"></div><p class="tagline">'+S.tag+'</p><div class="hdr-info"><p><b>السجل التجاري:</b> <code>'+S.reg+'</code></p><p><b>الرقم الضريبي:</b> <code>'+S.tax+'</code></p></div></div><div style="text-align:left"><div class="title-box"><h2>تقرير تقويم الحجوزات</h2><p>'+artistName+'</p></div><div class="rid"><div class="rl">رقم التقرير</div><div class="rv">'+rn+'</div></div></div></div></div>'+
    '<div class="content">'+
    '<div class="asec"><div class="acard"><div class="al">الفنان:</div><div class="ainfo"><div class="aph">'+artistName.charAt(0)+'</div><div><div class="an">'+artistName+'</div><div class="acat">'+MO[cur.getMonth()]+' '+cur.getFullYear()+'</div></div></div></div><div style="text-align:left;display:flex;align-items:center"><div class="dg"><span class="dl">تاريخ الإصدار:</span><span class="dv">'+rd+'</span><span class="dl">حجوزات الشهر:</span><span class="dv">'+monthB.length+'</span><span class="dl">الإيرادات:</span><span class="dv">'+totalRev.toLocaleString()+' ج.م</span></div></div></div>'+
    '<div class="stitle">تفاصيل الحجوزات — '+MO[cur.getMonth()]+' '+cur.getFullYear()+'</div>'+
    (monthB.length===0?'<p style="text-align:center;color:#888;padding:30px">لا توجد حجوزات في هذا الشهر</p>':'<table class="tbl"><thead><tr><th style="text-align:right">#</th><th style="text-align:right">التاريخ</th><th style="text-align:center">اليوم</th><th style="text-align:center">الوقت</th><th style="text-align:right">العميل</th><th style="text-align:center">المبلغ</th><th style="text-align:center">الحالة</th></tr></thead><tbody>'+rows+'</tbody><tfoot><tr style="background:#0a0a0a;color:#D4AF37;font-weight:900"><td colspan="5" style="text-align:right;padding:10px">الإجمالي</td><td class="gold" style="padding:10px">'+totalRev.toLocaleString()+' ج.م</td><td></td></tr></tfoot></table>')+
    '</div>'+
    '<div class="ftr"><div class="ftr-grid"><div class="ftr-left"><h4>الشروط والأحكام:</h4><ul><li><span class="dot">•</span>هذا التقرير صادر آلياً من نظام Nooryi Studio.</li><li><span class="dot">•</span>يمكن التحقق من صحته عبر مسح رمز QR.</li></ul></div><div class="stamp-col"><div class="stamp"><div class="stamp-ring"></div><div class="stamp-txt"><div class="s1">NOORYI</div><div class="sline"></div><div class="s2">STUDIO</div><div class="s3">✓ معتمد رسمياً</div></div></div><div class="stamp-label">ختم المنصة الرسمي</div></div><div class="qr-col"><div class="qr-box"><img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data='+encodeURIComponent(vu)+'" width="80" height="80"/></div><div class="qr-label">امسح للتحقق من صحة التقرير</div></div></div><div class="sig"><div class="sig-line"></div><div class="sig-name">توقيع المدير المالي</div><div class="sig-dept">Nooryi Studio Finance Dept.</div></div><div class="copyright">© '+new Date().getFullYear()+' '+S.name+' — جميع الحقوق محفوظة</div></div>'+
  '</div>'

  const handlePrint=()=>{const win=window.open("","_blank","width=800,height=1100");if(!win){alert("اسمح بالنوافذ المنبثقة");return}win.document.write('<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>تقويم '+artistName+'</title><style>'+$HEADER_CSS+'</style></head><body>'+printHTML+'</body></html>');win.document.close();setTimeout(()=>win.print(),800)}

  return(
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><div className="badge-gold mb-3">التقويم</div><h1 className="text-3xl font-black text-white flex items-center gap-2"><Calendar size={28} className="text-[#D4AF37]"/> تقويم {artistName}</h1><p className="text-gray-400 text-sm mt-1">{monthB.length} حجز في {MO[cur.getMonth()]} • إيرادات: {totalRev.toLocaleString()} ج.م</p></div>
        <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#0a0a0a] rounded-xl font-black text-sm hover:shadow-lg transition"><Printer size={16}/> طباعة</button>
      </div>
      <div className="bg-[#111] rounded-2xl p-4 border border-[#D4AF37]/20 flex items-center justify-between">
        <button onClick={()=>setCur(new Date(cur.getFullYear(),cur.getMonth()-1,1))} className="p-2 hover:bg-[#1a1a1a] rounded-lg"><ChevronRight size={20} className="text-[#D4AF37]"/></button>
        <h2 className="text-xl font-black text-white">{MO[cur.getMonth()]} {cur.getFullYear()}</h2>
        <button onClick={()=>setCur(new Date(cur.getFullYear(),cur.getMonth()+1,1))} className="p-2 hover:bg-[#1a1a1a] rounded-lg"><ChevronLeft size={20} className="text-[#D4AF37]"/></button>
      </div>
      <div className="flex items-center gap-4 flex-wrap"><div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-500"></div><span className="text-xs text-gray-400">محجوز</span></div><div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#D4AF37]"></div><span className="text-xs text-gray-400">اليوم</span></div><div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#1a1a1a] border border-[#D4AF37]/20"></div><span className="text-xs text-gray-400">متاح</span></div></div>
      <div className="bg-[#111] rounded-2xl border border-[#D4AF37]/20 overflow-hidden"><div className="grid grid-cols-7">{DA.map(d=><div key={d} className="bg-[#0a0a0a] text-[#D4AF37] text-center py-3 font-black text-sm border-b border-[#D4AF37]/20">{d}</div>)}{days.map((day,i)=>{if(!day)return<div key={"e"+i} className="aspect-square bg-[#0a0a0a]/50"></div>;const k=dk(day),ib=!!bMap[k],it=k===today,isel=k===sel;return<button key={k} onClick={()=>setSel(isel?null:k)} className={"aspect-square flex flex-col items-center justify-center relative border border-[#D4AF37]/5 transition-all "+(ib?"bg-red-500/20 hover:bg-red-500/30":"bg-[#1a1a1a] hover:bg-[#222]")+(it?" ring-2 ring-[#D4AF37] ring-inset":"")+(isel?" ring-2 ring-white ring-inset":"")}><span className={"text-lg font-black "+(ib?"text-red-400":it?"text-[#D4AF37]":"text-gray-300")}>{day.getDate()}</span>{ib&&<div className="absolute bottom-1 w-2 h-2 rounded-full bg-red-500"></div>}</button>})}</div></div>
      {sel&&<div className="bg-[#111] rounded-2xl p-5 border border-[#D4AF37]/20"><h3 className="font-black text-white mb-3 flex items-center gap-2"><Calendar size={18} className="text-[#D4AF37]"/> تفاصيل {sel}</h3>{selB.length===0?<p className="text-gray-500 text-sm">متاح للحجز ✅</p>:selB.map((b,i)=>(<div key={i} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-xl border border-red-500/20 mb-2"><div className="flex items-center gap-3"><User size={16} className="text-red-400"/><div><p className="font-bold text-white text-sm">{b.client}</p><p className="text-xs text-gray-400">{b.timeSlot}</p></div></div><div className="text-left"><p className="font-bold text-[#D4AF37] text-sm">{b.amount.toLocaleString()} ج.م</p><span className="text-xs text-red-400">{b.status}</span></div></div>))}</div>}
    </div>
  )
}