"use client"
import { DollarSign, TrendingUp, CheckCircle2, Clock, Printer, Download } from "lucide-react"

const S={name:"Nooryi Studio",tag:"STUDIO FOR ARTISTS & EVENTS",reg:"123456789",tax:"300000000000003",web:"https://nooryi-studio.vercel.app"}

export default function ManagerStatsClient({data}:{data:any}){
  const a=data.artist
  const rd=new Date().toLocaleDateString("ar-EG",{year:"numeric",month:"long",day:"numeric"})
  const rn="RPT-"+a.id.slice(-6).toUpperCase()+"-"+Date.now().toString(36).toUpperCase()
  const vu=S.web+"/invoice/verify?id="+rn+"&type=artist-report"

  const tRows=(data.recent||[]).map((b:any,i:number)=>'<tr><td class="mono">'+String(i+1).padStart(2,'0')+'</td><td class="bold">'+b.clientName+'</td><td style="text-align:center">'+(b.date?new Date(b.date).toLocaleDateString("ar-EG"):"—")+'</td><td>'+(b.venue?.name||"—")+'</td><td class="gold">'+Number(b.grossAmount||0).toLocaleString()+' ج.م</td></tr>').join("")

  const printHTML='<div class="page">'+
    '<div class="hdr"><div class="hdr-flex"><div><h1>Nooryi</h1><div class="gold-line"></div><p class="tagline">'+S.tag+'</p><div class="hdr-info"><p><b>السجل التجاري:</b> <code>'+S.reg+'</code></p><p><b>الرقم الضريبي:</b> <code>'+S.tax+'</code></p></div></div><div style="text-align:left"><div class="title-box"><h2>تقرير مالي شامل</h2><p>'+a.name+'</p></div><div class="rid"><div class="rl">رقم التقرير</div><div class="rv">'+rn+'</div></div></div></div></div>'+
    '<div class="content">'+
    '<div class="asec"><div class="acard"><div class="al">الفنان:</div><div class="ainfo"><div class="aph">'+a.name.charAt(0)+'</div><div><div class="an">'+a.name+'</div><div class="acat">'+(a.category||"فنان")+'</div><div class="acm">عمولة المنصة: '+data.commissionRate+'%</div></div></div></div><div style="text-align:left;display:flex;align-items:center"><div class="dg"><span class="dl">تاريخ الإصدار:</span><span class="dv">'+rd+'</span><span class="dl">الحجوزات:</span><span class="dv">'+data.total+'</span><span class="dl">مؤكدة:</span><span class="dv">'+data.confirmed+'</span><span class="dl">مكتملة:</span><span class="dv">'+data.completed+'</span><span class="dl">التقييم:</span><span class="dv">'+Number(data.rating).toFixed(1)+' ⭐ ('+data.ratingCount+')</span></div></div></div>'+
    '<div class="stitle">الملخص التنفيذي</div>'+
    '<div class="sgrid"><div class="sc dk"><div class="sl">إجمالي الإيرادات</div><div class="sv">'+data.revenue.toLocaleString()+'</div><div class="su">ج.م</div></div><div class="sc lt"><div class="sl">حجوزات مؤكدة</div><div class="sv">'+data.confirmed+'</div></div><div class="sc lt"><div class="sl">قيد المراجعة</div><div class="sv">'+data.pending+'</div></div><div class="sc lt"><div class="sl">صافي الفنان</div><div class="sv">'+data.net.toLocaleString()+'</div><div class="su">ج.م</div></div></div>'+
    '<div class="stitle">آخر الحجوزات المؤكدة</div>'+
    (data.recent.length===0?'<p style="text-align:center;color:#888;padding:20px">لا توجد حجوزات</p>':'<table class="tbl"><thead><tr><th style="text-align:right">#</th><th style="text-align:right">العميل</th><th style="text-align:center">التاريخ</th><th style="text-align:right">المكان</th><th style="text-align:center">المبلغ</th></tr></thead><tbody>'+tRows+'</tbody></table>')+
    '<div class="fin"><div class="fbox"><div class="frow"><span class="fl">إجمالي الإيرادات:</span><span class="fv">'+data.revenue.toLocaleString()+' ج.م</span></div><div class="frow gr"><span class="fl">عمولة المنصة ('+data.commissionRate+'%):</span><span class="fv red">-'+data.commission.toLocaleString()+' ج.م</span></div><div class="frow tot"><span class="fl">صافي الفنان:</span><span class="fv">'+data.net.toLocaleString()+' ج.م</span></div></div></div>'+
    '</div>'+
    '<div class="ftr"><div class="ftr-grid"><div class="ftr-left"><h4>الشروط والأحكام:</h4><ul><li><span class="dot">•</span>هذا التقرير صادر آلياً من نظام Nooryi Studio.</li><li><span class="dot">•</span>يمكن التحقق من صحته عبر مسح رمز QR أدناه.</li><li><span class="dot">•</span>البيانات قابلة للتغيير دون إشعار مسبق.</li></ul></div><div class="stamp-col"><div class="stamp"><div class="stamp-ring"></div><div class="stamp-txt"><div class="s1">NOORYI</div><div class="sline"></div><div class="s2">STUDIO</div><div class="s3">✓ معتمد رسمياً</div></div></div><div class="stamp-label">ختم المنصة الرسمي</div></div><div class="qr-col"><div class="qr-box"><img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data='+encodeURIComponent(vu)+'" width="80" height="80"/></div><div class="qr-label">امسح للتحقق من صحة التقرير</div></div></div><div class="sig"><div class="sig-line"></div><div class="sig-name">توقيع المدير المالي</div><div class="sig-dept">Nooryi Studio Finance Dept.</div></div><div class="copyright">© '+new Date().getFullYear()+' '+S.name+' — جميع الحقوق محفوظة | ترخيص '+S.reg+'</div></div>'+
  '</div>'

  const handlePrint=()=>{const win=window.open("","_blank","width=800,height=1100");if(!win){alert("اسمح بالنوافذ المنبثقة للطباعة");return}win.document.write('<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>تقرير مالي — '+a.name+'</title><style>'+$HEADER_CSS+'</style></head><body>'+printHTML+'</body></html>');win.document.close();setTimeout(()=>win.print(),800)}

  return(
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><div className="badge-gold mb-3">التقارير المالية</div><h1 className="text-3xl font-black text-white flex items-center gap-2"><TrendingUp size={28} className="text-[#D4AF37]"/> تقرير {a.name}</h1><p className="text-gray-400 text-sm mt-1">{rd}</p></div>
        <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#0a0a0a] rounded-xl font-black text-sm hover:shadow-lg transition"><Download size={20}/> حفظ / طباعة</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0a0a0a] p-5 rounded-2xl text-center border border-[#D4AF37]/20"><DollarSign className="w-8 h-8 text-[#D4AF37] mx-auto mb-2"/><p className="text-xs text-gray-400">الإيرادات</p><p className="text-xl font-black text-[#D4AF37]">{data.revenue.toLocaleString()}</p><p className="text-xs text-gray-500">ج.م</p></div>
        <div className="bg-[#111] p-5 rounded-2xl text-center border border-[#D4AF37]/20"><CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2"/><p className="text-xs text-gray-400">مؤكدة</p><p className="text-xl font-black text-white">{data.confirmed}</p></div>
        <div className="bg-[#111] p-5 rounded-2xl text-center border border-[#D4AF37]/20"><Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2"/><p className="text-xs text-gray-400">بانتظار</p><p className="text-xl font-black text-white">{data.pending}</p></div>
        <div className="bg-[#111] p-5 rounded-2xl text-center border border-[#D4AF37]/20"><TrendingUp className="w-8 h-8 text-[#D4AF37] mx-auto mb-2"/><p className="text-xs text-gray-400">صافي الفنان</p><p className="text-xl font-black text-white">{data.net.toLocaleString()}</p><p className="text-xs text-gray-500">ج.م</p></div>
      </div>
      <div className="bg-white p-10 rounded-2xl shadow-2xl border border-gray-200">
        <p className="text-center text-gray-500 text-sm mb-4">👆 هذه معاينة — اضغط "حفظ / طباعة" للحصول على تقرير A4 كامل بالترويسة والختم وQR Code</p>
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-black p-4 rounded-xl text-center"><p className="text-[10px] text-gray-400">الإيرادات</p><p className="text-lg font-black text-[#D4AF37]">{data.revenue.toLocaleString()}</p></div>
          <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-200"><p className="text-[10px] text-gray-500">مؤكدة</p><p className="text-lg font-black">{data.confirmed}</p></div>
          <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-200"><p className="text-[10px] text-gray-500">بانتظار</p><p className="text-lg font-black">{data.pending}</p></div>
          <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-200"><p className="text-[10px] text-gray-500">صافي</p><p className="text-lg font-black">{data.net.toLocaleString()}</p></div>
        </div>
        <div className="border-t-2 border-[#D4AF37] pt-4 flex justify-between items-center">
          <p className="text-xs text-gray-400">رقم التقرير: <span className="font-mono text-gray-600">{rn}</span></p>
          <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#0a0a0a] font-black rounded-xl hover:shadow-lg transition"><Printer size={16}/> طباعة الآن</button>
        </div>
      </div>
    </div>
  )
}