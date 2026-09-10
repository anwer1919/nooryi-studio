"use client"
import { DollarSign, Calendar, Star, TrendingUp, Award, Printer, Users, FileText, Eye, X } from "lucide-react"

const STUDIO_INFO = { name: "Nooryi Studio", nameAr: "استوديو نوري", tagline: "منصة حجز الفنانين والفعاليات", phone: "+20 100 000 0000", email: "info@noorystudio.com", address: "القاهرة، جمهورية مصر العربية", website: "https://nooryi-studio.vercel.app", licenseNumber: "NS-2026-001" }

export default function ManagerStatsView({ data }: { data: any }) {
  const artist = data.artist
  const reportId = `RPT-${Date.now().toString(36).toUpperCase()}`
  const reportDate = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })

  return (
    <div dir="rtl" className="p-6 space-y-6 max-w-7xl mx-auto">
      <style>{`
        @media print { .no-print { display: none !important; } body { background: white !important; } @page { margin: 1cm; size: A4; } }
      `}</style>

      <div className="no-print flex items-center justify-between">
        <div><h1 className="text-4xl font-black text-gray-900 dark:text-fg">التقرير المالي</h1><p className="text-muted mt-1">{artist.name} — تقرير مالي كامل قابل للطباعة</p></div>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F5A623] to-[#E8961A] text-[#111] font-black rounded-xl hover:shadow-lg transition"><Printer size={18} /> طباعة التقرير</button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
        {[
          { label:"إجمالي الحجوزات", value:data.total, icon:Calendar, bg:"bg-blue-100 dark:bg-blue-900/30", ic:"text-blue-600" },
          { label:"إجمالي الإيرادات", value:data.revenue.toLocaleString()+" ج.م", icon:DollarSign, bg:"bg-green-100 dark:bg-green-900/30", ic:"text-green-600" },
          { label:"عمولة المنصة", value:Math.round(data.revenue*data.commission/100).toLocaleString()+" ج.م", icon:TrendingUp, bg:"bg-[#F5A623]/20", ic:"text-[#F5A623]" },
          { label:"صافي الفنان", value:Math.round(data.net).toLocaleString()+" ج.م", icon:Users, bg:"bg-purple-100 dark:bg-purple-900/30", ic:"text-purple-600" },
        ].map((s,i)=>(<div key={i} className="bg-white dark:bg-surface p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3"><div className={"w-12 h-12 rounded-xl "+s.bg+" flex items-center justify-center"}><s.icon size={24} className={s.ic}/></div><div><p className="text-xs text-muted">{s.label}</p><p className="text-2xl font-black">{s.value}</p></div></div>
        </div>))}
      </div>

      {/* Artist Financial Report Card */}
      <div className="bg-white dark:bg-surface rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-black text-gray-900 dark:text-fg flex items-center gap-2"><Award size={24} className="text-[#F5A623]" /> التقرير المالي — {artist.name}</h2>
          <p className="text-sm text-muted mt-1">اضغط "طباعة التقرير" للحصول على نسخة A4 كاملة</p>
        </div>
        <div className="p-5 hover:bg-gray-50 dark:hover:bg-card transition">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-1">
              {artist.profileImage ? <img src={artist.profileImage} alt="" className="w-14 h-14 rounded-full object-cover" /> : <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center text-[#111] font-black text-xl">{artist.name.charAt(0)}</div>}
              <div><p className="font-black text-lg text-gray-900 dark:text-fg">{artist.name}</p><p className="text-xs text-muted">{artist.category || "فنان"} — {data.total} حجز</p></div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center"><p className="text-xs text-muted">الإيرادات</p><p className="font-black text-gray-900 dark:text-fg">{data.revenue.toLocaleString()} ج.م</p></div>
              <div className="text-center"><p className="text-xs text-muted">نسبة العمولة</p><p className="font-bold text-yellow-600">{data.commission}%</p></div>
              <div className="text-center"><p className="text-xs text-muted">عمولة المنصة</p><p className="font-black text-[#F5A623]">{Math.round(data.revenue*data.commission/100).toLocaleString()} ج.م</p></div>
              <div className="text-center"><p className="text-xs text-muted">صافي الفنان</p><p className="font-black text-green-600">{Math.round(data.net).toLocaleString()} ج.م</p></div>
            </div>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="border-t border-gray-200 dark:border-gray-800">
          <div className="p-5"><h3 className="font-black text-gray-900 dark:text-fg mb-3">📋 آخر الحجوزات المؤكدة</h3>
            {data.recent.length === 0 ? <p className="text-muted text-center py-4">لا حجوزات</p> : (
              <table className="w-full"><thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="text-right py-2 text-xs font-bold text-muted">العميل</th><th className="text-center py-2 text-xs font-bold text-muted">التاريخ</th><th className="text-center py-2 text-xs font-bold text-muted">المكان</th><th className="text-center py-2 text-xs font-bold text-muted">المبلغ</th></tr></thead><tbody>
                {data.recent.map((b:any)=><tr key={b.id} className="border-b border-gray-100 dark:border-gray-800"><td className="py-2 font-bold text-sm">{b.clientName}</td><td className="py-2 text-center text-sm">{b.date?new Date(b.date).toLocaleDateString("ar-EG"):"—"}</td><td className="py-2 text-center text-sm">{b.venue?.name||"—"}</td><td className="py-2 text-center font-black text-[#F5A623] text-sm">{Number(b.grossAmount||0).toLocaleString()} ج.م</td></tr>)}
              </tbody></table>
            )}
          </div>
        </div>

        {/* Ratings */}
        <div className="p-5 border-t border-gray-200 dark:border-gray-800">
          <h3 className="font-black text-gray-900 dark:text-fg mb-3">⭐ التقييمات</h3>
          <div className="flex items-center gap-4"><span className="text-5xl font-black text-[#F5A623]">{Number(data.rating).toFixed(1)}</span><div><div className="flex gap-1">{[1,2,3,4,5].map(i=><Star key={i} size={20} className={i<=Math.round(data.rating)?"text-[#F5A623] fill-[#F5A623]":"text-muted"}/>)}</div><p className="text-sm text-muted mt-1">{data.ratingCount} تقييم</p></div></div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-card p-5 border-t-2 border-gray-200 dark:border-gray-700 text-center">
          <div className="flex items-center justify-center gap-2 mb-2"><Award size={16} className="text-[#F5A623]"/><span className="text-sm font-bold text-[#F5A623]">Nooryi Studio — تقرير مالي معتمد</span></div>
          <p className="text-xs text-muted">{reportDate} | رقم التقرير: <span className="font-mono" dir="ltr">{reportId}</span></p>
        </div>
      </div>
    </div>
  )
}