"use client"
import { DollarSign, Calendar, Star, TrendingUp, Award } from "lucide-react"

export default function StatsClient({ data }: { data: any }) {
  const stats = [
    { label:"إجمالي الحجوزات", value:data.total.toString(), icon:Calendar, color:"from-blue-500 to-blue-700" },
    { label:"حجوزات مؤكدة", value:data.confirmed.toString(), icon:Star, color:"from-green-500 to-green-700" },
    { label:"إجمالي الإيرادات", value:data.revenue.toLocaleString()+" ج.م", icon:DollarSign, color:"from-[#D4AF37] to-[#b8941f]" },
    { label:"صافي الفنان", value:Math.round(data.net).toLocaleString()+" ج.م", icon:TrendingUp, color:"from-purple-500 to-purple-700" },
  ]

  return (
    <div className="print-area space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s,i)=>(<div key={i} className="bg-[#111] rounded-2xl p-5 border border-[#D4AF37]/20 relative overflow-hidden">
          <div className={"absolute top-0 left-0 right-0 h-1 bg-gradient-to-r "+s.color}></div>
          <div className={"w-10 h-10 rounded-xl bg-gradient-to-br "+s.color+" flex items-center justify-center mb-3"}><s.icon size={18} className="text-white"/></div>
          <p className="text-2xl font-black text-white">{s.value}</p><p className="text-xs text-gray-400 mt-1">{s.label}</p>
        </div>))}
      </div>

      <div className="bg-[#111] rounded-2xl p-6 border border-[#D4AF37]/20">
        <h3 className="font-black text-white mb-4 text-lg">💰 التفصيل المالي</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-3 border-b border-[#D4AF37]/10"><span className="text-gray-400">الإيرادات</span><span className="font-black text-white text-lg">{data.revenue.toLocaleString()} ج.م</span></div>
          <div className="flex justify-between py-3 border-b border-[#D4AF37]/10"><span className="text-gray-400">عمولة المنصة ({data.commission}%)</span><span className="font-black text-red-400 text-lg">-{Math.round(data.revenue*data.commission/100).toLocaleString()} ج.م</span></div>
          <div className="flex justify-between py-3 bg-[#D4AF37]/10 rounded-xl px-4"><span className="font-bold text-[#D4AF37]">صافي الفنان</span><span className="font-black text-[#D4AF37] text-xl">{Math.round(data.net).toLocaleString()} ج.م</span></div>
        </div>
      </div>

      <div className="bg-[#111] rounded-2xl p-6 border border-[#D4AF37]/20">
        <h3 className="font-black text-white mb-4 text-lg">⭐ التقييمات</h3>
        <div className="flex items-center gap-4">
          <span className="text-5xl font-black text-[#D4AF37]">{Number(data.rating).toFixed(1)}</span>
          <div><div className="flex gap-1">{[1,2,3,4,5].map(i=><Star key={i} size={20} className={i<=Math.round(data.rating)?"text-[#D4AF37] fill-[#D4AF37]":"text-gray-600"}/>)}</div><p className="text-sm text-gray-400 mt-1">{data.ratingCount} تقييم</p></div>
        </div>
      </div>

      <div className="bg-[#111] rounded-2xl border border-[#D4AF37]/20 overflow-hidden">
        <div className="p-5 border-b border-[#D4AF37]/20"><h3 className="font-black text-white text-lg">📋 آخر الحجوزات</h3></div>
        {data.recent.length===0 ? <p className="p-8 text-center text-gray-500">لا حجوزات</p> : (
          <table className="w-full"><thead><tr className="border-b border-[#D4AF37]/20">
            <th className="text-right py-3 px-5 text-xs font-bold text-[#D4AF37]">العميل</th>
            <th className="text-center py-3 px-5 text-xs font-bold text-[#D4AF37]">التاريخ</th>
            <th className="text-center py-3 px-5 text-xs font-bold text-[#D4AF37]">المبلغ</th>
            <th className="text-center py-3 px-5 text-xs font-bold text-[#D4AF37]">الحالة</th>
          </tr></thead><tbody>
            {data.recent.map((b:any)=>(<tr key={b.id} className="border-b border-[#D4AF37]/5">
              <td className="py-3 px-5 font-bold text-white">{b.clientName}</td>
              <td className="py-3 px-5 text-center text-gray-300">{b.date?new Date(b.date).toLocaleDateString("ar-EG"):"—"}</td>
              <td className="py-3 px-5 text-center font-black text-[#D4AF37]">{Number(b.grossAmount||0).toLocaleString()}</td>
              <td className="py-3 px-5 text-center"><span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 font-bold">{b.status}</span></td>
            </tr>))}
          </tbody></table>
        )}
      </div>

      <div className="bg-[#111] rounded-2xl p-5 border border-[#D4AF37]/20 text-center">
        <div className="flex items-center justify-center gap-2 mb-2"><Award size={16} className="text-[#D4AF37]"/><span className="text-sm font-bold text-[#D4AF37]">Nooryi Studio — تقرير مالي معتمد</span></div>
        <p className="text-xs text-gray-500">{data.date}</p>
      </div>
    </div>
  )
}