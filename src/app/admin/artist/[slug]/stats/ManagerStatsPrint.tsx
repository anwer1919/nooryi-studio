"use client"
import { Download, Printer } from "lucide-react"
import printCSS from "./print.css?raw"

const S = { name:"Nooryi Studio", ar:"استوديو نوري", tag:"STUDIO FOR ARTISTS & EVENTS", phone:"+20 100 000 0000", email:"info@noorystudio.com", addr:"القاهرة، جمهورية مصر العربية", web:"https://nooryi-studio.vercel.app", lic:"NS-2026-001", tax:"300000000000003", reg:"123456789" }

export default function ManagerStatsPrint({ data }: { data: any }) {
  const a = data.artist
  const rd = new Date().toLocaleDateString("ar-EG",{year:"numeric",month:"long",day:"numeric"})
  const rn = "RPT-" + a.id.slice(-6).toUpperCase() + "-" + Date.now().toString(36).toUpperCase()
  const vu = S.web + "/invoice/verify?id=" + rn + "&type=artist-report"

  const rows = (data.recent||[]).map(function(b:any,i:number){
    return '<tr><td class="mono">'+String(i+1).padStart(2,'0')+'</td><td class="bold">'+(b.clientName||'—')+'</td><td style="text-align:center">'+(b.date?new Date(b.date).toLocaleDateString("ar-EG"):"—")+'</td><td>'+(b.venue?.name||"—")+'</td><td class="gold">'+Number(b.grossAmount||0).toLocaleString()+' ج.م</td></tr>'
  }).join("")

  const html = '<div class="report">' +
    '<div class="watermark"><span>NOORYI</span></div>' +
    '<div class="stamp"><div class="stamp-inner"><div class="stamp-ring"></div><div class="stamp-text"><div class="t1">NOORYI</div><div class="line"></div><div class="t2">STUDIO</div><div class="t3">✓ معتمد رسمياً</div></div></div></div>' +
    '<div class="header"><div class="header-flex"><div><h1>Nooryi</h1><div class="gold-line"></div><p class="tagline">'+S.tag+'</p><div class="info"><p><b>السجل التجاري:</b> <code>'+S.reg+'</code></p><p><b>الرقم الضريبي:</b> <code>'+S.tax+'</code></p></div></div><div style="text-align:left"><div class="title-box"><h2>تقرير مالي</h2><p>'+a.name+'</p></div><div class="report-id"><div class="label">رقم التقرير</div><div class="num">'+rn+'</div></div></div></div></div>' +
    '<div class="artist-section"><div class="artist-card"><div class="alabel">الفنان:</div><div class="artist-info">'+(a.profileImage?'<img src="'+a.profileImage+'" class="artist-img"/>':'<div class="artist-ph">'+a.name.charAt(0)+'</div>')+'<div><div class="aname">'+a.name+'</div><div class="acat">'+(a.category||"فنان")+'</div><div class="acomm">عمولة المنصة: '+data.commissionRate+'%</div></div></div></div><div style="text-align:left;display:flex;align-items:center"><div class="dgrid"><span class="dl">تاريخ الإصدار:</span><span class="dv">'+rd+'</span><span class="dl">إجمالي الحجوزات:</span><span class="dv">'+data.total+'</span><span class="dl">مؤكدة:</span><span class="dv">'+data.confirmed+'</span><span class="dl">مكتملة:</span><span class="dv">'+data.completed+'</span><span class="dl">التقييم:</span><span class="dv">'+Number(data.rating).toFixed(1)+' ⭐ ('+data.ratingCount+')</span></div></div></div>' +
    '<div class="stitle">الملخص التنفيذي</div><div class="sgrid"><div class="sc dk"><div class="sl">إجمالي الإيرادات</div><div class="sv">'+data.revenue.toLocaleString()+'</div><div class="su">ج.م</div></div><div class="sc lt"><div class="sl">حجوزات مؤكدة</div><div class="sv">'+data.confirmed+'</div></div><div class="sc lt"><div class="sl">قيد المراجعة</div><div class="sv">'+data.pending+'</div></div><div class="sc lt"><div class="sl">صافي الفنان</div><div class="sv">'+data.net.toLocaleString()+'</div><div class="su">ج.م</div></div></div>' +
    '<div class="stitle">آخر الحجوزات المؤكدة</div>'+(rows?'<table class="tbl"><thead><tr><th style="text-align:right">#</th><th style="text-align:right">العميل</th><th style="text-align:center">التاريخ</th><th style="text-align:right">المكان</th><th style="text-align:center">المبلغ</th></tr></thead><tbody>'+rows+'</tbody></table>':'<p style="text-align:center;color:#888;padding:24px">لا توجد حجوزات</p>') +
    '<div class="financial"><div class="fbox"><div class="frow"><span class="fl">إجمالي الإيرادات:</span><span class="fv">'+data.revenue.toLocaleString()+' ج.م</span></div><div class="frow gr"><span class="fl">عمولة المنصة ('+data.commissionRate+'%):</span><span class="fv red">-'+data.commission.toLocaleString()+' ج.م</span></div><div class="frow tot"><span class="fl">صافي الفنان:</span><span class="fv">'+data.net.toLocaleString()+' ج.م</span></div></div></div>' +
    '<div class="footer"><div class="fgrid"><div><h4>الشروط والأحكام:</h4><ul><li><span class="dot">•</span>هذا التقرير صادر آلياً من نظام Nooryi Studio.</li><li><span class="dot">•</span>يمكن التحقق بمسح رمز QR أدناه.</li></ul></div><div class="sig"><div class="sig-line"></div><div class="sig-name">توقيع المدير المالي</div><div class="sig-dept">Nooryi Studio Finance Dept.</div></div></div><div class="qr-section"><div class="qr-wrap"><div class="qr-box"><img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data='+encodeURIComponent(vu)+'" width="80" height="80"/></div><div class="qr-label">امسح للتحقق</div></div></div></div>' +
  '</div>'

  var handlePrint = function() {
    var win = window.open("","_blank","width=800,height=1100")
    if (!win) { alert("يرجى السماح بالنوافذ المنبثقة"); return }
    win.document.write("<!DOCTYPE html><html dir='rtl' lang='ar'><head><meta charset='UTF-8'><title>تقرير مالي — "+a.name+"</title><style>"+printCSS+"</style></head><body>"+html+"</body></html>")
    win.document.close()
    setTimeout(function(){ win.print() }, 800)
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-[210mm] mx-auto mb-6 flex gap-3 justify-end">
        <button onClick={()=>window.history.back()} className="px-6 py-3 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition">العودة</button>
        <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition"><Download size={20}/> حفظ / طباعة</button>
      </div>
      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] p-8 text-white">
          <div className="flex justify-between items-start">
            <div><h1 className="text-5xl font-black mb-2">Nooryi</h1><div className="w-24 h-1 bg-[#D4AF37] mb-3"></div><p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{S.tag}</p></div>
            <div className="text-left"><div className="bg-black px-6 py-3 rounded-lg border border-[#D4AF37]/30"><h2 className="text-xl font-black text-[#D4AF37]">تقرير مالي</h2><p className="text-sm text-white mt-1">{a.name}</p></div><div className="bg-[#D4AF37] px-3 py-1.5 rounded-lg mt-3"><p className="text-xs font-bold text-black">رقم: {rn}</p></div></div>
          </div>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-black p-4 rounded-xl text-center"><p className="text-xs text-gray-400">الإيرادات</p><p className="text-xl font-black text-[#D4AF37]">{data.revenue.toLocaleString()}</p></div>
            <div className="bg-gray-50 p-4 rounded-xl text-center border-2 border-black"><p className="text-xs text-gray-500">مؤكدة</p><p className="text-xl font-black">{data.confirmed}</p></div>
            <div className="bg-gray-50 p-4 rounded-xl text-center border-2 border-black"><p className="text-xs text-gray-500">قيد المراجعة</p><p className="text-xl font-black">{data.pending}</p></div>
            <div className="bg-gray-50 p-4 rounded-xl text-center border-2 border-black"><p className="text-xs text-gray-500">صافي</p><p className="text-xl font-black">{data.net.toLocaleString()}</p></div>
          </div>
          <div className="border-t-2 border-[#D4AF37] pt-4 flex justify-between items-center">
            <p className="text-sm text-gray-500">التقرير جاهز للطباعة بتنسيق A4 احترافي</p>
            <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-black font-black rounded-xl hover:shadow-lg transition"><Printer size={16}/> طباعة الآن</button>
          </div>
        </div>
      </div>
    </div>
  )
}