"use client"
import { useRef } from "react"
import { DollarSign, TrendingUp, CheckCircle2, Clock, Star, Printer, Download } from "lucide-react"
import QRCode from "react-qr-code"

const STUDIO = { name: "Nooryi Studio", nameAr: "استوديو نوري", tagline: "STUDIO FOR ARTISTS & EVENTS", phone: "+20 100 000 0000", email: "info@noorystudio.com", address: "القاهرة، جمهورية مصر العربية", website: "https://nooryi-studio.vercel.app", license: "NS-2026-001", taxId: "300000000000003", commercialReg: "123456789" }

export default function ManagerStatsPrint({ data }: { data: any }) {
  const artist = data.artist
  const reportDate = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })
  const reportNumber = `RPT-${artist.id.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
  const verifyUrl = `${STUDIO.website}/invoice/verify?id=${reportNumber}&type=artist-report`

  const handlePrint = () => {
    const el = document.getElementById("report-content")
    if (!el) return

    const win = window.open("", "_blank", "width=800,height=1100")
    if (!win) { alert("يرجى السماح بالنوافذ المنبثقة للطباعة"); return }

    win.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>تقرير مالي — ${artist.name}</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  body { font-family: 'Cairo', sans-serif; background: white; color: black; padding: 10mm; direction: rtl; }
  @page { margin: 10mm; size: A4 portrait; }
</style>
</head>
<body>${el.innerHTML}</body>
</html>`)
    win.document.close()
    setTimeout(() => { win.print(); }, 500)
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      {/* أزرار */}
      <div className="max-w-[210mm] mx-auto mb-6 flex gap-3 justify-end flex-wrap">
        <button onClick={() => window.history.back()} className="px-6 py-3 bg-gray-600 text-fg rounded-xl font-bold shadow-xl hover:bg-gray-700 transition">العودة</button>
        <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 bg-black text-fg rounded-xl font-bold shadow-xl hover:bg-gray-800 transition"><Download size={20}/> حفظ / طباعة</button>
      </div>

      {/* ═══ محتوى التقرير ═══ */}
      <div id="report-content" className="max-w-[210mm] mx-auto bg-white shadow-2xl p-12 md:p-16 relative overflow-hidden">
        {/* علامة مائية */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <span className="text-[150px] font-black text-[#F5A623] rotate-[-30deg] tracking-tighter">NOORYI</span>
        </div>

        {/* ختم */}
        <div className="absolute bottom-32 left-20 w-40 h-40 pointer-events-none opacity-60">
          <div className="relative w-full h-full border-[3px] border-black rounded-full flex items-center justify-center rotate-[-15deg]">
            <div className="absolute inset-2 border-2 border-[#F5A623] rounded-full"></div>
            <div className="flex flex-col items-center justify-center gap-1 z-10">
              <span className="text-black font-black text-2xl tracking-wider">NOORYI</span>
              <div className="w-24 h-0.5 bg-[#F5A623]"></div>
              <span className="text-black font-bold text-xs uppercase tracking-widest">STUDIO</span>
              <span className="text-[#F5A623] font-bold text-[10px] mt-1">✓ معتمد رسمياً</span>
            </div>
          </div>
        </div>

        {/* الترويسة */}
        <div className="mb-12 pb-8 border-b-4 border-black relative">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F5A623]"></div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-6xl font-black text-black mb-2 tracking-tight">Nooryi</h1>
              <div className="w-32 h-1 bg-[#F5A623] mb-3"></div>
              <p className="text-sm text-muted font-bold uppercase tracking-[0.3em] mb-4">{STUDIO.tagline}</p>
              <div className="text-xs text-muted space-y-1.5">
                <p><span className="font-bold text-black">السجل التجاري:</span> <span className="font-mono">{STUDIO.commercialReg}</span></p>
                <p><span className="font-bold text-black">الرقم الضريبي:</span> <span className="font-mono">{STUDIO.taxId}</span></p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="bg-black px-8 py-4 rounded-lg shadow-2xl">
                <h2 className="text-2xl font-black text-[#F5A623] uppercase tracking-[0.2em]">تقرير مالي</h2>
                <p className="text-sm text-white mt-1">{artist.name}</p>
              </div>
              <div className="bg-[#F5A623] px-4 py-2 rounded-lg">
                <p className="text-xs font-bold text-black">رقم التقرير</p>
                <p className="font-mono font-bold text-black">{reportNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* معلومات الفنان */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-black">
            <h3 className="text-xs font-black text-[#F5A623] uppercase tracking-[0.3em] mb-3">الفنان:</h3>
            <div className="flex items-center gap-4">
              {artist.profileImage ? <img src={artist.profileImage} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-[#F5A623]"/> : <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center"><span className="text-[#111] text-2xl font-black">{artist.name.charAt(0)}</span></div>}
              <div><p className="text-xl font-bold text-black">{artist.name}</p><p className="text-sm text-muted">{artist.category || "فنان"}</p><p className="text-xs text-muted mt-1">عمولة المنصة: {data.commissionRate}%</p></div>
            </div>
          </div>
          <div className="md:text-left">
            <div className="inline-grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <span className="text-muted">تاريخ الإصدار:</span><span suppressHydrationWarning className="font-bold text-black">{reportDate}</span>
              <span className="text-muted">إجمالي الحجوزات:</span><span className="font-bold text-black">{data.total}</span>
              <span className="text-muted">مؤكدة:</span><span className="font-bold text-black">{data.confirmed}</span>
              <span className="text-muted">مكتملة:</span><span className="font-bold text-black">{data.completed}</span>
              <span className="text-muted">التقييم:</span><span className="font-bold text-black">{Number(data.rating).toFixed(1)} ⭐ ({data.ratingCount})</span>
            </div>
          </div>
        </div>

        {/* الملخص التنفيذي */}
        <div className="mb-12">
          <h3 className="text-lg font-black text-black mb-4 pb-2 border-b-2 border-[#F5A623]">الملخص التنفيذي</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black p-5 rounded-xl text-center"><DollarSign className="w-8 h-8 text-[#F5A623] mx-auto mb-2"/><p className="text-xs text-muted mb-1">إجمالي الإيرادات</p><p className="text-xl font-black text-[#F5A623]">{data.revenue.toLocaleString()}</p><p className="text-xs text-muted">ج.م</p></div>
            <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border-2 border-black text-center"><CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2"/><p className="text-xs text-muted mb-1">حجوزات مؤكدة</p><p className="text-xl font-black text-black">{data.confirmed}</p></div>
            <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border-2 border-black text-center"><Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2"/><p className="text-xs text-muted mb-1">قيد المراجعة</p><p className="text-xl font-black text-black">{data.pending}</p></div>
            <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border-2 border-black text-center"><TrendingUp className="w-8 h-8 text-[#F5A623] mx-auto mb-2"/><p className="text-xs text-muted mb-1">صافي الفنان</p><p className="text-xl font-black text-black">{data.net.toLocaleString()}</p><p className="text-xs text-muted">ج.م</p></div>
          </div>
        </div>

        {/* جدول آخر الحجوزات */}
        <div className="mb-12">
          <h3 className="text-lg font-black text-black mb-4 pb-2 border-b-2 border-[#F5A623]">آخر الحجوزات المؤكدة</h3>
          {data.recent.length === 0 ? <p className="text-muted text-center py-6">لا توجد حجوزات مؤكدة</p> : (
            <table className="w-full border-collapse text-sm">
              <thead><tr className="bg-bg text-fg"><th className="px-3 py-2.5 text-right text-xs font-bold">#</th><th className="px-3 py-2.5 text-right text-xs font-bold">العميل</th><th className="px-3 py-2.5 text-center text-xs font-bold">التاريخ</th><th className="px-3 py-2.5 text-right text-xs font-bold">المكان</th><th className="px-3 py-2.5 text-center text-xs font-bold">المبلغ</th></tr></thead>
              <tbody>{data.recent.map((b: any, i: number) => (<tr key={b.id} className={`border-b border-gray-200 ${i%2===0?'bg-white':'bg-gray-50'}`}><td className="px-3 py-2.5 text-xs text-muted font-mono">{String(i+1).padStart(2,'0')}</td><td className="px-3 py-2.5 font-bold">{b.clientName}</td><td className="px-3 py-2.5 text-center">{b.date?new Date(b.date).toLocaleDateString("ar-EG"):"—"}</td><td className="px-3 py-2.5">{b.venue?.name||"—"}</td><td className="px-3 py-2.5 text-center font-black text-[#F5A623]">{Number(b.grossAmount||0).toLocaleString()} ج.م</td></tr>))}</tbody>
            </table>
          )}
        </div>

        {/* التفصيل المالي */}
        <div className="flex justify-end mb-16">
          <div className="w-full md:w-[400px] rounded-2xl border-2 border-black overflow-hidden shadow-xl">
            <div className="flex justify-between py-4 px-6 border-b border-gray-200"><span className="text-muted font-bold">إجمالي الإيرادات:</span><span className="font-bold text-black text-lg">{data.revenue.toLocaleString()} ج.م</span></div>
            <div className="flex justify-between py-4 px-6 border-b border-gray-200 bg-gray-50"><span className="text-muted font-bold">عمولة المنصة ({data.commissionRate}%):</span><span className="font-bold text-red-600 text-lg">-{data.commission.toLocaleString()} ج.م</span></div>
            <div className="flex justify-between py-6 px-6 bg-black text-fg"><span className="font-bold text-xl text-[#F5A623]">صافي الفنان:</span><span className="font-black text-3xl text-[#F5A623]">{data.net.toLocaleString()} ج.م</span></div>
          </div>
        </div>

        {/* التذييل */}
        <div className="border-t-4 border-black pt-8 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#F5A623]"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div><h4 className="font-black text-black mb-3 text-sm uppercase tracking-[0.2em]">الشروط والأحكام:</h4><ul className="text-xs text-muted space-y-2"><li className="flex gap-2"><span className="text-[#F5A623] font-bold">•</span><span>هذا التقرير صادر آلياً من نظام Nooryi Studio.</span></li><li className="flex gap-2"><span className="text-[#F5A623] font-bold">•</span><span>يمكن التحقق من صحته عبر مسح رمز QR أدناه.</span></li></ul></div>
            <div className="flex flex-col items-end justify-end"><div className="text-center"><div className="w-48 h-20 border-b-2 border-black mb-3 mx-auto"></div><p className="text-sm font-black text-black">توقيع المدير المالي</p><p className="text-xs text-muted mt-1">Nooryi Studio Finance Dept.</p></div></div>
          </div>
          <div className="flex justify-center pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="bg-white p-3 rounded-xl border-2 border-black inline-block shadow-lg"><QRCode value={verifyUrl} size={80} level="H" bgColor="#FFFFFF" fgColor="#000000"/></div>
              <p className="text-[10px] text-muted mt-2 font-bold">امسح للتحقق من صحة التقرير</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}