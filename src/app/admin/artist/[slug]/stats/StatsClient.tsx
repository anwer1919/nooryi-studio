"use client"
import { DollarSign, Calendar, Star, TrendingUp, Award, Printer } from "lucide-react"

export default function StatsClient({ data }: { data: any }) {
  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4 no-print">
        <div>
          <div className="badge-gold mb-3">التقارير المالية</div>
          <h1 className="text-4xl font-black text-gray-900">تقرير {data.artistName}</h1>
          <p className="text-muted mt-1">{data.date}</p>
        </div>
        <button onClick={()=>window.print()} className="btn-gold"><Printer size={16}/> طباعة التقرير</button>
      </div>

      <div className="print-area space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label:"إجمالي الحجوزات", value:data.total, icon:Calendar, color:"from-blue-500 to-blue-700" },
            { label:"مؤكدة", value:data.confirmed, icon:Star, color:"from-green-500 to-green-700" },
            { label:"الإيرادات", value:data.revenue.toLocaleString()+" ج.م", icon:DollarSign, color:"from-[#F5A623] to-[#E8961A]" },
            { label:"صافي الفنان", value:Math.round(data.net).toLocaleString()+" ج.م", icon:TrendingUp, color:"from-purple-500 to-purple-700" },
          ].map((s,i)=>(<div key={i} className="stat-card relative overflow-hidden">
            <div className={"absolute top-0 left-0 right-0 h-1 bg-gradient-to-r "+s.color}></div>
            <div className={"w-10 h-10 rounded-xl bg-gradient-to-br "+s.color+" flex items-center justify-center mb-3"}><s.icon size={18} className="text-fg"/></div>
            <p className="text-2xl font-black text-gray-900">{s.value}</p><p className="text-xs text-muted mt-1">{s.label}</p>
          </div>))}
        </div>

        <div className="card-pro p-6">
          <h3 className="font-black text-gray-900 mb-4 text-lg">💰 التفصيل المالي</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-3 border-b border-gray-100"><span className="text-muted">الإيرادات</span><span className="font-black text-gray-900 text-lg">{data.revenue.toLocaleString()} ج.م</span></div>
            <div className="flex justify-between py-3 border-b border-gray-100"><span className="text-muted">عمولة المنصة ({data.commission}%)</span><span className="font-black text-red-600 text-lg">-{Math.round(data.revenue*data.commission/100).toLocaleString()} ج.م</span></div>
            <div className="flex justify-between py-3 bg-[#faf8f0] rounded-xl px-4 border border-[#F5A623]/20"><span className="font-bold text-[#E8961A]">صافي الفنان</span><span className="font-black text-[#E8961A] text-xl">{Math.round(data.net).toLocaleString()} ج.م</span></div>
          </div>
        </div>

        <div className="card-pro p-6">
          <h3 className="font-black text-gray-900 mb-4 text-lg">⭐ التقييمات</h3>
          <div className="flex items-center gap-4"><span className="text-5xl font-black text-[#E8961A]">{Number(data.rating).toFixed(1)}</span><div><div className="flex gap-1">{[1,2,3,4,5].map(i=><Star key={i} size={20} className={i<=Math.round(data.rating)?"text-[#F5A623] fill-[#F5A623]":"text-muted"}/>)}</div><p className="text-sm text-muted mt-1">{data.ratingCount} تقييم</p></div></div>
        </div>

        <div className="card-pro overflow-hidden">
          <div className="p-5 border-b border-gray-100"><h3 className="font-black text-gray-900 text-lg">📋 آخر الحجوزات المؤكدة</h3></div>
          {data.recent.length===0 ? <p className="p-8 text-center text-muted">لا حجوزات مؤكدة</p> : (
            <table className="table-pro w-full"><thead><tr><th>العميل</th><th>التاريخ</th><th>المبلغ</th></tr></thead><tbody>{data.recent.map((b:any)=>(
              <tr key={b.id}><td className="font-bold">{b.clientName}</td><td className="text-center">{b.date?new Date(b.date).toLocaleDateString("ar-EG"):"—"}</td><td className="text-center font-black text-[#E8961A]">{Number(b.grossAmount||0).toLocaleString()} ج.م</td></tr>
            ))}</tbody></table>
          )}
        </div>

        <div className="card-pro p-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-2"><Award size={16} className="text-[#E8961A]"/><span className="text-sm font-bold text-[#E8961A]">Nooryi Studio — تقرير مالي معتمد</span></div>
          <p className="text-xs text-muted">{data.date}</p>
        </div>
      </div>
    </div>
  )
}