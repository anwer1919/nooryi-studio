"use client"
import { useState } from "react"
import QRCode from "react-qr-code"
import { Calendar as CalIcon, Clock, MapPin, Printer, ChevronLeft, ChevronRight, Loader2, User, Phone, Eye, X, Shield, DollarSign } from "lucide-react"

const STUDIO_INFO = { name: "Nooryi Studio", nameAr: "استوديو نوري", tagline: "منصة حجز الفنانين والفعاليات", phone: "+20 100 000 0000", email: "info@noorystudio.com", address: "القاهرة، جمهورية مصر العربية", website: "https://nooryi-studio.vercel.app", licenseNumber: "NS-2026-001" }

const statusConfig: any = {
  PENDING_APPROVAL: { label: "قيد المراجعة", bg: "bg-yellow-100", text: "text-yellow-700" },
  APPROVED: { label: "موافق عليه", bg: "bg-blue-100", text: "text-blue-700" },
  CONFIRMED: { label: "مؤكد", bg: "bg-green-100", text: "text-green-700" },
  COMPLETED: { label: "مكتمل", bg: "bg-emerald-100", text: "text-emerald-700" },
}

export default function ManagerCalendarView({ artist, bookings }: { artist: any; bookings: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showPreview, setShowPreview] = useState(false)

  const monthBookings = bookings.filter(b => {
    const d = new Date(b.eventDate || b.date)
    return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()
  })

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  const monthName = currentDate.toLocaleDateString("ar-EG", { month: "long", year: "numeric" })
  const reportId = `CAL-${Date.now().toString(36).toUpperCase()}`
  const reportDate = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
  const verifyUrl = `${STUDIO_INFO.website}/verify/calendar/${artist.slug}?report=${reportId}&month=${currentDate.getMonth()+1}&year=${currentDate.getFullYear()}`
  const totalRevenue = monthBookings.reduce((sum: number, b: any) => sum + Number(b.grossAmount || 0), 0)

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 297mm; min-height: 210mm; background: white !important; color: black !important; }
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      <div dir="rtl" className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between no-print">
          <div>
            <div className="badge-gold mb-3">التقويم</div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white">تقويم الحجوزات</h1>
            <p className="text-gray-500 mt-1">{artist.name} — عرض وطباعة جدول الحجوزات</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowPreview(true)} disabled={monthBookings.length === 0} className="inline-flex items-center gap-2 px-5 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition disabled:opacity-50"><Eye size={18} /> معاينة التقرير</button>
            <button onClick={() => window.print()} disabled={monthBookings.length === 0} className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50"><Printer size={18} /> طباعة</button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="bg-white dark:bg-[#111] rounded-2xl border overflow-hidden no-print">
          <div className="bg-gradient-to-r from-[#0a0a0a] to-[#111] p-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center">
                  <span className="text-[#111] text-2xl font-black">{artist.name?.charAt(0) || "ف"}</span>
                </div>
                <div><h2 className="text-2xl font-black">{artist.name}</h2><p className="text-sm text-gray-300">{monthName}</p></div>
              </div>
              <div className="text-right"><p className="text-xs text-gray-400">حجوزات هذا الشهر</p><p className="text-3xl font-black text-[#D4AF37]">{monthBookings.length}</p></div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-[#1a1a1a] border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"><ChevronRight size={20} /></button>
              <h3 className="text-xl font-black min-w-[200px] text-center">{monthName}</h3>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"><ChevronLeft size={20} /></button>
            </div>
          </div>
          <div className="p-6">
            {monthBookings.length === 0 ? (
              <div className="text-center py-12"><CalIcon className="mx-auto text-gray-300 mb-3" size={48} /><p className="text-gray-500">لا توجد حجوزات في {monthName}</p></div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {monthBookings.map((b: any) => {
                  const status = statusConfig[b.status] || statusConfig.PENDING_APPROVAL
                  const eventDate = new Date(b.eventDate || b.date)
                  return (
                    <div key={b.id} className="border rounded-2xl p-5 hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-3">
                        <div className="bg-gradient-to-br from-[#D4AF37] to-[#b8941f] text-[#111] rounded-xl p-3 text-center min-w-[60px]">
                          <p className="text-2xl font-black">{eventDate.getDate()}</p>
                          <p className="text-[10px] font-bold uppercase">{eventDate.toLocaleDateString("ar-EG", { month: "short" })}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text}`}>{status.label}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 mb-2"><Clock size={14} className="text-[#D4AF37]" /><span className="font-bold text-sm">{b.timeSlot || "—"}</span></div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2 mb-1"><User size={14} className="text-gray-400" /><span className="font-bold text-sm">{b.clientName || "—"}</span></div>
                        {b.clientPhone && <div className="flex items-center gap-2 text-gray-500 text-xs"><Phone size={12} /><span dir="ltr">{b.clientPhone}</span></div>}
                      </div>
                      {b.grossAmount && <div className="mt-3 text-center"><span className="text-lg font-black text-[#D4AF37]">{Number(b.grossAmount).toLocaleString()} ج.م</span></div>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* PRINT AREA — A4 Landscape (نفس تصميم /admin/calendar) */}
        <div id="print-report">
          <div className="h-3 bg-gradient-to-r from-[#D4AF37] via-[#f4e5b8] to-[#D4AF37]"></div>
          <div className="px-10 pt-6 pb-4 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center shadow-2xl"><span className="text-[#111] text-3xl font-black">N</span></div>
                <div><h1 className="text-3xl font-black">{STUDIO_INFO.nameAr}</h1><p className="text-[#D4AF37] font-bold">{STUDIO_INFO.name}</p><p className="text-xs text-gray-400 mt-1">{STUDIO_INFO.tagline}</p></div>
              </div>
              <div className="text-right"><div className="inline-block px-4 py-2 bg-[#D4AF37]/20 border border-[#D4AF37] rounded-lg"><p className="text-xs text-[#D4AF37] font-bold">تقرير تقويم الحجوزات</p><p className="text-xs text-gray-300 font-mono mt-1" dir="ltr">{reportId}</p></div></div>
            </div>
            <div className="mt-4 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
          </div>
          <div className="px-10 py-4 bg-[#faf8f0] border-b-4 border-[#D4AF37] flex items-center justify-between">
            <div className="flex items-center gap-4">
              {artist.profileImage ? <img src={artist.profileImage} alt="" className="w-14 h-14 rounded-xl object-cover" /> : <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center"><span className="text-[#111] text-2xl font-black">{artist.name.charAt(0)}</span></div>}
              <div><p className="text-xs text-gray-500 font-bold uppercase">تقويم</p><h2 className="text-2xl font-black">{artist.name}</h2><p className="text-sm text-gray-600">{artist.category || "فنان"} — {monthName}</p></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center"><p className="text-xs text-gray-500">الحجوزات</p><p className="text-xl font-black">{monthBookings.length}</p></div>
              <div className="text-center"><p className="text-xs text-gray-500">الإيرادات</p><p className="text-lg font-black text-[#D4AF37]">{totalRevenue.toLocaleString()}</p><p className="text-[10px] text-gray-400">ج.م</p></div>
              <div className="text-center"><p className="text-xs text-gray-500">تاريخ الإصدار</p><p className="text-xs font-bold">{reportDate}</p></div>
            </div>
          </div>
          <div className="px-10 py-4">
            <h3 className="text-lg font-black mb-3 flex items-center gap-2"><div className="w-1 h-5 bg-[#D4AF37] rounded"></div>تفاصيل الحجوزات — {monthName}</h3>
            {monthBookings.length === 0 ? <div className="py-12 text-center text-gray-400"><p>لا توجد حجوزات في هذا الشهر</p></div> : (
              <table className="w-full border-collapse">
                <thead><tr className="bg-[#0a0a0a] text-white">
                  <th className="px-3 py-2 text-right text-xs">#</th><th className="px-3 py-2 text-right text-xs">التاريخ</th><th className="px-3 py-2 text-center text-xs">اليوم</th><th className="px-3 py-2 text-center text-xs">الوقت</th><th className="px-3 py-2 text-right text-xs">العميل</th><th className="px-3 py-2 text-right text-xs">الهاتف</th><th className="px-3 py-2 text-center text-xs">المبلغ</th><th className="px-3 py-2 text-center text-xs">الحالة</th>
                </tr></thead>
                <tbody>{monthBookings.map((b: any, i: number) => {
                  const d = new Date(b.eventDate || b.date); const status = statusConfig[b.status] || statusConfig.PENDING_APPROVAL
                  return (<tr key={b.id} className={`border-b ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-3 py-2 text-xs text-gray-500 font-mono">{String(i+1).padStart(2,'0')}</td>
                    <td className="px-3 py-2 font-black text-sm">{d.getDate()}/{d.getMonth()+1}</td>
                    <td className="px-3 py-2 text-center text-xs">{d.toLocaleDateString("ar-EG", { weekday: "short" })}</td>
                    <td className="px-3 py-2 text-center text-xs">{b.timeSlot || "—"}</td>
                    <td className="px-3 py-2 font-bold text-sm">{b.clientName || "—"}</td>
                    <td className="px-3 py-2 text-xs font-mono" dir="ltr">{b.clientPhone || "—"}</td>
                    <td className="px-3 py-2 text-center font-black text-[#D4AF37] text-sm">{b.grossAmount ? Number(b.grossAmount).toLocaleString() : "—"}</td>
                    <td className="px-3 py-2 text-center"><span className={`inline-block px-2 py-1 rounded text-[10px] font-bold ${status.bg} ${status.text}`}>{status.label}</span></td>
                  </tr>)
                })}</tbody>
                <tfoot><tr className="bg-[#1a1a1a] text-white font-black"><td colSpan={6} className="px-3 py-2 text-right">الإجمالي</td><td className="px-3 py-2 text-center text-[#D4AF37]">{totalRevenue.toLocaleString()} ج.م</td><td></td></tr></tfoot>
              </table>
            )}
          </div>
          <div className="px-10 py-6 bg-gradient-to-b from-white to-[#faf8f0] border-t border-gray-200">
            <div className="grid grid-cols-3 gap-6 items-center">
              <div className="text-right"><p className="text-xs font-bold uppercase tracking-wider mb-2">تواصل معنا</p><div className="space-y-1 text-xs text-gray-700"><p>{STUDIO_INFO.phone}</p><p>{STUDIO_INFO.email}</p><p>{STUDIO_INFO.address}</p><p dir="ltr" className="font-mono text-[#D4AF37]">{STUDIO_INFO.website.replace("https://", "")}</p></div></div>
              <div className="flex flex-col items-center justify-center"><div className="relative"><div className="w-28 h-28 rounded-full border-4 border-[#D4AF37] flex items-center justify-center" style={{ transform: 'rotate(-15deg)', boxShadow: 'inset 0 0 0 2px #D4AF37, 0 0 0 2px #D4AF37' }}><div className="text-center"><p className="text-[7px] font-bold text-[#D4AF37] uppercase tracking-widest">{STUDIO_INFO.name}</p><p className="text-xs font-black text-[#D4AF37] my-1">✦ معتمد ✦</p><p className="text-[9px] font-black text-[#D4AF37]">APPROVED</p></div></div><div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]" style={{ transform: 'rotate(-15deg) scale(1.15)', opacity: 0.5 }}></div></div><p className="text-[9px] text-gray-500 mt-2 font-bold uppercase tracking-widest">ختم المنصة الرسمي</p></div>
              <div className="flex flex-col items-center"><div className="bg-white p-2 rounded-xl border-2 border-[#D4AF37] shadow-lg"><QRCode value={verifyUrl} size={90} level="H" bgColor="#FFFFFF" fgColor="#0a0a0a" /></div><p className="text-[9px] text-gray-500 mt-2 font-bold uppercase tracking-wider">امسح للتحقق</p></div>
            </div>
            <div className="mt-4 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
            <p className="mt-3 text-[10px] text-gray-500 text-center">© {new Date().getFullYear()} {STUDIO_INFO.name} — جميع الحقوق محفوظة | ترخيص <span className="font-mono">{STUDIO_INFO.licenseNumber}</span></p>
          </div>
          <div className="h-3 bg-gradient-to-r from-[#D4AF37] via-[#f4e5b8] to-[#D4AF37]"></div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm overflow-y-auto no-print">
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#0a0a0a] to-[#111] border-b border-[#D4AF37]/30">
              <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3"><Eye size={20} className="text-[#D4AF37]" /><h2 className="text-xl font-black text-white">معاينة تقرير التقويم</h2></div>
                <div className="flex items-center gap-3">
                  <button onClick={() => { setShowPreview(false); setTimeout(() => window.print(), 300) }} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-bold rounded-lg"><Printer size={16} /> طباعة الآن</button>
                  <button onClick={() => setShowPreview(false)} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg"><X size={16} /> إغلاق</button>
                </div>
              </div>
            </div>
            <div className="max-w-5xl mx-auto py-8 px-4">
              <div className="bg-white rounded-lg shadow-2xl overflow-hidden" style={{ aspectRatio: '297/210' }}>
                <div className="h-2 bg-gradient-to-r from-[#D4AF37] via-[#f4e5b8] to-[#D4AF37]"></div>
                <div className="px-8 pt-6 pb-4 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] text-white"><div className="flex items-center gap-4"><div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center"><span className="text-[#111] text-2xl font-black">N</span></div><div><h1 className="text-2xl font-black">{STUDIO_INFO.nameAr}</h1><p className="text-[#D4AF37] font-bold text-sm">{STUDIO_INFO.name}</p></div></div></div>
                <div className="px-8 py-4 bg-[#faf8f0] border-b-4 border-[#D4AF37]"><h2 className="text-xl font-black">{artist.name} — {monthName}</h2><p className="text-sm text-gray-600">تقرير تقويم الحجوزات — رقم: <span className="font-mono" dir="ltr">{reportId}</span></p></div>
                <div className="px-8 py-4"><p className="text-sm text-gray-600 mb-2">عدد الحجوزات: <strong>{monthBookings.length}</strong> — إجمالي الإيرادات: <strong className="text-[#D4AF37]">{totalRevenue.toLocaleString()} ج.م</strong></p></div>
                <div className="px-8 py-4 bg-gradient-to-b from-white to-[#faf8f0]"><div className="grid grid-cols-3 gap-4 items-center"><div className="text-xs text-gray-600"><p className="font-bold">تواصل معنا:</p><p>{STUDIO_INFO.phone}</p><p>{STUDIO_INFO.email}</p></div><div className="flex flex-col items-center"><div className="w-16 h-16 rounded-full border-4 border-[#D4AF37] flex items-center justify-center" style={{ transform: 'rotate(-15deg)' }}><p className="text-[8px] font-black text-[#D4AF37]">✦ معتمد ✦</p></div></div><div className="flex flex-col items-center"><div className="bg-white p-1 rounded border-2 border-[#D4AF37]"><QRCode value={verifyUrl} size={60} level="H" /></div><p className="text-[9px] text-gray-500 mt-1">امسح للتحقق</p></div></div></div>
                <div className="h-2 bg-gradient-to-r from-[#D4AF37] via-[#f4e5b8] to-[#D4AF37]"></div>
              </div>
              <div className="mt-6 flex justify-center gap-4">
                <button onClick={() => { setShowPreview(false); setTimeout(() => window.print(), 300) }} className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-black rounded-xl"><Printer size={20} className="inline ml-2" /> طباعة الآن</button>
                <button onClick={() => setShowPreview(false)} className="px-8 py-4 bg-gray-800 text-white font-bold rounded-xl"><X size={20} className="inline ml-2" /> إغلاق</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}