"use client"
import { DollarSign, TrendingUp, CheckCircle2, Clock, Printer, Download } from "lucide-react"
import QRCode from "react-qr-code"

const S = { name: "Nooryi Studio", ar: "استوديو نوري", tag: "STUDIO FOR ARTISTS & EVENTS", phone: "+20 100 000 0000", email: "info@noorystudio.com", addr: "القاهرة، جمهورية مصر العربية", web: "https://nooryi-studio.vercel.app", lic: "NS-2026-001", tax: "300000000000003", reg: "123456789" }

// CSS كامل للتقرير — يُحقن في صفحة الطباعة
const PRINT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800;900&display=swap');
* { margin:0; padding:0; box-sizing:border-box; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; color-adjust:exact !important; }
body { font-family:'Cairo',sans-serif; background:#fff; color:#000; direction:rtl; padding:0; }
@page { margin:10mm; size:A4 portrait; }

.report { max-width:210mm; margin:0 auto; background:#fff; padding:12mm 16mm; position:relative; overflow:hidden; }
.watermark { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; pointer-events:none; opacity:0.03; }
.watermark span { font-size:150px; font-weight:900; color:#D4AF37; transform:rotate(-30deg); letter-spacing:-0.05em; }

/* ختم */
.stamp { position:absolute; bottom:120px; left:80px; width:160px; height:160px; pointer-events:none; opacity:0.6; }
.stamp-inner { width:100%; height:100%; border:3px solid #000; border-radius:50%; display:flex; align-items:center; justify-content:center; transform:rotate(-15deg); position:relative; }
.stamp-ring { position:absolute; inset:8px; border:2px solid #D4AF37; border-radius:50%; }
.stamp-text { text-align:center; z-index:1; }
.stamp-text .t1 { font-size:24px; font-weight:900; color:#000; letter-spacing:0.1em; }
.stamp-text .line { width:96px; height:2px; background:#D4AF37; margin:4px auto; }
.stamp-text .t2 { font-size:12px; font-weight:700; color:#000; text-transform:uppercase; letter-spacing:0.2em; }
.stamp-text .t3 { font-size:10px; font-weight:700; color:#D4AF37; margin-top:4px; }

/* ترويسة */
.header { margin-bottom:48px; padding-bottom:32px; border-bottom:4px solid #000; position:relative; }
.header::after { content:''; position:absolute; bottom:0; left:0; right:0; height:4px; background:#D4AF37; }
.header-flex { display:flex; justify-content:space-between; align-items:flex-start; }
.header h1 { font-size:60px; font-weight:900; color:#000; margin-bottom:8px; letter-spacing:-0.02em; }
.gold-line { width:128px; height:4px; background:#D4AF37; margin-bottom:12px; }
.header .tagline { font-size:14px; color:#666; font-weight:700; text-transform:uppercase; letter-spacing:0.3em; margin-bottom:16px; }
.header .info { font-size:12px; color:#888; line-height:1.8; }
.header .info b { color:#000; }
.header .info code { font-family:monospace; }
.title-box { background:#000; padding:16px 32px; border-radius:8px; text-align:center; }
.title-box h2 { font-size:24px; font-weight:900; color:#D4AF37; text-transform:uppercase; letter-spacing:0.2em; }
.title-box p { font-size:14px; color:#fff; margin-top:4px; }
.report-id { background:#D4AF37; padding:8px 16px; border-radius:8px; margin-top:12px; text-align:center; }
.report-id .label { font-size:12px; font-weight:700; color:#000; }
.report-id .num { font-family:monospace; font-weight:700; color:#000; }

/* معلومات الفنان */
.artist-section { display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-bottom:48px; }
.artist-card { background:linear-gradient(135deg,#f9fafb,#fff); padding:24px; border-radius:12px; border:2px solid #000; }
.artist-card .label { font-size:12px; font-weight:900; color:#D4AF37; text-transform:uppercase; letter-spacing:0.3em; margin-bottom:12px; }
.artist-info { display:flex; align-items:center; gap:16px; }
.artist-img { width:64px; height:64px; border-radius:16px; object-fit:cover; border:2px solid #D4AF37; }
.artist-placeholder { width:64px; height:64px; border-radius:16px; background:linear-gradient(135deg,#D4AF37,#b8941f); display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:900; color:#0a0a0a; }
.artist-name { font-size:20px; font-weight:700; color:#000; }
.artist-cat { font-size:14px; color:#666; }
.artist-comm { font-size:12px; color:#888; margin-top:4px; }
.details-grid { display:inline-grid; grid-template-columns:auto auto; gap:12px 32px; font-size:14px; text-align:left; }
.details-grid .lbl { color:#888; }
.details-grid .val { font-weight:700; color:#000; }

/* الملخص */
.summary-title { font-size:18px; font-weight:900; color:#000; margin-bottom:16px; padding-bottom:8px; border-bottom:2px solid #D4AF37; }
.summary-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:48px; }
.summary-card { padding:20px; border-radius:12px; text-align:center; }
.summary-card.dark { background:#000; }
.summary-card.light { background:linear-gradient(135deg,#f9fafb,#fff); border:2px solid #000; }
.summary-card .icon { width:32px; height:32px; margin:0 auto 8px; }
.summary-card .s-label { font-size:12px; margin-bottom:4px; }
.summary-card.dark .s-label { color:#999; }
.summary-card.light .s-label { color:#888; }
.summary-card .s-val { font-size:20px; font-weight:900; }
.summary-card.dark .s-val { color:#D4AF37; }
.summary-card.light .s-val { color:#000; }
.summary-card .s-unit { font-size:12px; color:#999; }

/* الجدول */
.tbl { width:100%; border-collapse:collapse; font-size:14px; margin-bottom:48px; }
.tbl th { background:#0a0a0a; color:#fff; padding:10px 12px; font-size:12px; font-weight:700; }
.tbl td { padding:10px 12px; border-bottom:1px solid #e5e7eb; }
.tbl tr:nth-child(even) { background:#f9fafb; }
.tbl .mono { font-family:monospace; font-size:12px; color:#888; }
.tbl .gold { font-weight:900; color:#D4AF37; text-align:center; }
.tbl .bold { font-weight:700; }

/* التفصيل المالي */
.financial { display:flex; justify-content:flex-end; margin-bottom:64px; }
.financial-box { width:400px; border:2px solid #000; border-radius:16px; overflow:hidden; }
.fin-row { display:flex; justify-content:space-between; padding:16px 24px; border-bottom:1px solid #e5e7eb; }
.fin-row.gray { background:#f9fafb; }
.fin-row.total { background:#000; color:#fff; padding:24px; border:none; }
.fin-row .fin-label { font-weight:700; }
.fin-row.gray .fin-label { color:#666; }
.fin-row .fin-val { font-weight:700; color:#000; font-size:18px; }
.fin-row .fin-val.red { color:#dc2626; }
.fin-row.total .fin-label { color:#D4AF37; font-size:20px; }
.fin-row.total .fin-val { color:#D4AF37; font-size:30px; font-weight:900; }

/* التذييل */
.footer { border-top:4px solid #000; padding-top:32px; position:relative; }
.footer::before { content:''; position:absolute; top:0; left:0; right:0; height:4px; background:#D4AF37; }
.footer-grid { display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-bottom:32px; }
.footer h4 { font-weight:900; color:#000; font-size:14px; text-transform:uppercase; letter-spacing:0.2em; margin-bottom:12px; }
.footer ul { list-style:none; font-size:12px; color:#666; line-height:2; }
.footer ul li { display:flex; gap:8px; }
.footer ul .dot { color:#D4AF37; font-weight:700; }
.sig { text-align:center; }
.sig-line { width:192px; height:2px; background:#000; margin:0 auto 12px; }
.sig-name { font-size:14px; font-weight:900; color:#000; }
.sig-dept { font-size:12px; color:#888; margin-top:4px; }
.qr-section { display:flex; justify-content:center; padding-top:24px; border-top:1px solid #e5e7eb; }
.qr-wrap { text-align:center; }
.qr-box { background:#fff; padding:12px; border-radius:12px; border:2px solid #000; display:inline-block; }
.qr-label { font-size:10px; color:#888; font-weight:700; margin-top:8px; }
`@

export default function ManagerStatsPrint({ data }: { data: any }) {
  const a = data.artist
  const rd = new Date().toLocaleDateString("ar-EG", { year:"numeric", month:"long", day:"numeric" })
  const rn = `RPT-${a.id.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
  const vu = `${S.web}/invoice/verify?id=${rn}&type=artist-report`

  // بناء HTML التقرير
  const reportHTML = `
<div class="report">
  <div class="watermark"><span>NOORYI</span></div>
  <div class="stamp"><div class="stamp-inner"><div class="stamp-ring"></div><div class="stamp-text"><div class="t1">NOORYI</div><div class="line"></div><div class="t2">STUDIO</div><div class="t3">✓ معتمد رسمياً</div></div></div></div>

  <div class="header">
    <div class="header-flex">
      <div>
        <h1>Nooryi</h1>
        <div class="gold-line"></div>
        <p class="tagline">${S.tag}</p>
        <div class="info">
          <p><b>السجل التجاري:</b> <code>${S.reg}</code></p>
          <p><b>الرقم الضريبي:</b> <code>${S.tax}</code></p>
        </div>
      </div>
      <div style="text-align:left">
        <div class="title-box"><h2>تقرير مالي</h2><p>${a.name}</p></div>
        <div class="report-id"><div class="label">رقم التقرير</div><div class="num">${rn}</div></div>
      </div>
    </div>
  </div>

  <div class="artist-section">
    <div class="artist-card">
      <div class="label">الفنان:</div>
      <div class="artist-info">
        ${a.profileImage ? `<img src="${a.profileImage}" class="artist-img"/>` : `<div class="artist-placeholder">${a.name.charAt(0)}</div>`}
        <div><div class="artist-name">${a.name}</div><div class="artist-cat">${a.category||"فنان"}</div><div class="artist-comm">عمولة المنصة: ${data.commissionRate}%</div></div>
      </div>
    </div>
    <div style="text-align:left;display:flex;align-items:center">
      <div class="details-grid">
        <span class="lbl">تاريخ الإصدار:</span><span class="val">${rd}</span>
        <span class="lbl">إجمالي الحجوزات:</span><span class="val">${data.total}</span>
        <span class="lbl">مؤكدة:</span><span class="val">${data.confirmed}</span>
        <span class="lbl">مكتملة:</span><span class="val">${data.completed}</span>
        <span class="lbl">التقييم:</span><span class="val">${Number(data.rating).toFixed(1)} ⭐ (${data.ratingCount})</span>
      </div>
    </div>
  </div>

  <div class="summary-title">الملخص التنفيذي</div>
  <div class="summary-grid">
    <div class="summary-card dark"><div class="s-label">إجمالي الإيرادات</div><div class="s-val">${data.revenue.toLocaleString()}</div><div class="s-unit">ج.م</div></div>
    <div class="summary-card light"><div class="s-label">حجوزات مؤكدة</div><div class="s-val">${data.confirmed}</div></div>
    <div class="summary-card light"><div class="s-label">قيد المراجعة</div><div class="s-val">${data.pending}</div></div>
    <div class="summary-card light"><div class="s-label">صافي الفنان</div><div class="s-val">${data.net.toLocaleString()}</div><div class="s-unit">ج.م</div></div>
  </div>

  <div class="summary-title">آخر الحجوزات المؤكدة</div>
  ${data.recent.length === 0 ? '<p style="text-align:center;color:#888;padding:24px">لا توجد حجوزات مؤكدة</p>' : `
  <table class="tbl">
    <thead><tr><th style="text-align:right">#</th><th style="text-align:right">العميل</th><th style="text-align:center">التاريخ</th><th style="text-align:right">المكان</th><th style="text-align:center">المبلغ</th></tr></thead>
    <tbody>${data.recent.map((b:any,i:number)=>`<tr><td class="mono">${String(i+1).padStart(2,'0')}</td><td class="bold">${b.clientName}</td><td style="text-align:center">${b.date?new Date(b.date).toLocaleDateString("ar-EG"):"—"}</td><td>${b.venue?.name||"—"}</td><td class="gold">${Number(b.grossAmount||0).toLocaleString()} ج.م</td></tr>`).join('')}</tbody>
  </table>`}

  <div class="financial">
    <div class="financial-box">
      <div class="fin-row"><span class="fin-label">إجمالي الإيرادات:</span><span class="fin-val">${data.revenue.toLocaleString()} ج.م</span></div>
      <div class="fin-row gray"><span class="fin-label">عمولة المنصة (${data.commissionRate}%):</span><span class="fin-val red">-${data.commission.toLocaleString()} ج.م</span></div>
      <div class="fin-row total"><span class="fin-label">صافي الفنان:</span><span class="fin-val">${data.net.toLocaleString()} ج.م</span></div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-grid">
      <div><h4>الشروط والأحكام:</h4><ul><li><span class="dot">•</span>هذا التقرير صادر آلياً من نظام Nooryi Studio.</li><li><span class="dot">•</span>يمكن التحقق من صحته عبر مسح رمز QR أدناه.</li></ul></div>
      <div class="sig"><div class="sig-line"></div><div class="sig-name">توقيع المدير المالي</div><div class="sig-dept">Nooryi Studio Finance Dept.</div></div>
    </div>
    <div class="qr-section"><div class="qr-wrap"><div class="qr-box" id="qr-target"></div><div class="qr-label">امسح للتحقق من صحة التقرير</div></div></div>
  </div>
</div>`

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=800,height=1100")
    if (!win) { alert("يرجى السماح بالنوافذ المنبثقة"); return }
    win.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>تقرير مالي — ${a.name}</title><style>${PRINT_CSS}</style></head><body>${reportHTML}<script>
      // توليد QR Code باستخدام canvas
      (function(){
        var url = "${vu}";
        var target = document.getElementById("qr-target");
        // استخدام API بسيط لتوليد QR
        var img = document.createElement("img");
        img.src = "https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=" + encodeURIComponent(url);
        img.style.width = "80px";
        img.style.height = "80px";
        target.appendChild(img);
      })();
    </script></body></html>`)
    win.document.close()
    setTimeout(() => win.print(), 800)
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-[210mm] mx-auto mb-6 flex gap-3 justify-end">
        <button onClick={() => window.history.back()} className="px-6 py-3 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition">العودة</button>
        <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition"><Download size={20}/> حفظ / طباعة</button>
      </div>

      {/* معاينة على الشاشة */}
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
            <div className="bg-gray-50 p-4 rounded-xl text-center border-2 border-black"><p className="text-xs text-gray-500">صافي الفنان</p><p className="text-xl font-black">{data.net.toLocaleString()}</p></div>
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