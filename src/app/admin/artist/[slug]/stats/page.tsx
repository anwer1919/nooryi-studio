import { getManagerArtist } from "@/lib/managerAuth"
import { prisma } from "@/lib/prisma"
import { TrendingUp, DollarSign, Calendar, Star, Printer, Award } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ArtistStats({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { artist } = await getManagerArtist(slug)

  const [total, confirmed, completed, revenue, avgRating, recentBookings] = await Promise.all([
    prisma.booking.count({ where: { artistId: artist.id } }),
    prisma.booking.count({ where: { artistId: artist.id, status: { in: ["CONFIRMED", "APPROVED", "ACCEPTED"] } } }),
    prisma.booking.count({ where: { artistId: artist.id, status: "COMPLETED" } }),
    prisma.booking.aggregate({ where: { artistId: artist.id, status: { in: ["CONFIRMED", "COMPLETED", "APPROVED", "ACCEPTED"] } }, _sum: { grossAmount: true } }),
    prisma.review.aggregate({ where: { artistId: artist.id }, _avg: { rating: true }, _count: true }),
    prisma.booking.findMany({ where: { artistId: artist.id, status: { in: ["CONFIRMED", "COMPLETED", "APPROVED"] } }, orderBy: { date: "desc" }, take: 10, select: { id: true, date: true, clientName: true, grossAmount: true, status: true } }),
  ])

  const totalRevenue = Number(revenue._sum.grossAmount || 0)
  const commissionRate = Number((artist as any).commissionRate || 15)
  const commission = totalRevenue * commissionRate / 100
  const artistNet = totalRevenue - commission
  const conversionRate = total > 0 ? ((confirmed / total) * 100).toFixed(0) : "0"
  const reportDate = new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 no-print">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <TrendingUp size={28} className="text-[#D4AF37]" /> التقرير المالي — {artist.name}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{reportDate}</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] rounded-xl font-black text-sm hover:shadow-lg transition">
          <Printer size={16} /> طباعة التقرير
        </button>
      </div>

      <div className="print-area space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "إجمالي الحجوزات", value: total.toString(), icon: Calendar, color: "from-blue-500 to-blue-700" },
            { label: "حجوزات مؤكدة", value: confirmed.toString(), icon: Star, color: "from-green-500 to-green-700" },
            { label: "إجمالي الإيرادات", value: totalRevenue.toLocaleString() + " ج.م", icon: DollarSign, color: "from-[#D4AF37] to-[#b8941f]" },
            { label: "صافي الفنان", value: artistNet.toLocaleString(undefined, { maximumFractionDigits: 0 }) + " ج.م", icon: TrendingUp, color: "from-purple-500 to-purple-700" },
          ].map((s, i) => (
            <div key={i} className="bg-[#111] rounded-2xl p-5 border border-[#D4AF37]/20 relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${s.color}`}></div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}><s.icon size={18} className="text-white" /></div>
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Financial Breakdown */}
        <div className="bg-[#111] rounded-2xl p-6 border border-[#D4AF37]/20">
          <h3 className="font-black text-white mb-4 text-lg">💰 التفصيل المالي</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b border-[#D4AF37]/10">
              <span className="text-gray-400">إجمالي الإيرادات</span>
              <span className="font-black text-white text-lg">{totalRevenue.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[#D4AF37]/10">
              <span className="text-gray-400">عمولة المنصة ({commissionRate}%)</span>
              <span className="font-black text-red-400 text-lg">-{commission.toLocaleString(undefined, { maximumFractionDigits: 0 })} ج.م</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-[#D4AF37]/10 rounded-xl px-4">
              <span className="font-bold text-[#D4AF37]">صافي الفنان</span>
              <span className="font-black text-[#D4AF37] text-xl">{artistNet.toLocaleString(undefined, { maximumFractionDigits: 0 })} ج.م</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="bg-[#111] rounded-2xl p-6 border border-[#D4AF37]/20">
          <h3 className="font-black text-white mb-4 text-lg">⭐ التقييمات</h3>
          <div className="flex items-center gap-4">
            <span className="text-5xl font-black text-[#D4AF37]">{(avgRating._avg.rating || 0).toFixed(1)}</span>
            <div>
              <div className="flex gap-1">{[1,2,3,4,5].map(i => <Star key={i} size={20} className={i <= Math.round(avgRating._avg.rating || 0) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-600"} />)}</div>
              <p className="text-sm text-gray-400 mt-1">{avgRating._count} تقييم • معدل التحويل: {conversionRate}%</p>
            </div>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-[#111] rounded-2xl border border-[#D4AF37]/20 overflow-hidden">
          <div className="p-5 border-b border-[#D4AF37]/20">
            <h3 className="font-black text-white text-lg">📋 آخر الحجوزات المؤكدة</h3>
          </div>
          {recentBookings.length === 0 ? (
            <p className="p-8 text-center text-gray-500">لا توجد حجوزات مؤكدة</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#D4AF37]/20">
                    <th className="text-right py-3 px-5 text-xs font-bold text-[#D4AF37]">العميل</th>
                    <th className="text-center py-3 px-5 text-xs font-bold text-[#D4AF37]">التاريخ</th>
                    <th className="text-center py-3 px-5 text-xs font-bold text-[#D4AF37]">المبلغ</th>
                    <th className="text-center py-3 px-5 text-xs font-bold text-[#D4AF37]">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b: any) => (
                    <tr key={b.id} className="border-b border-[#D4AF37]/5 hover:bg-[#1a1a1a]">
                      <td className="py-3 px-5 font-bold text-white">{b.clientName}</td>
                      <td className="py-3 px-5 text-center text-gray-300">{b.date ? new Date(b.date).toLocaleDateString("ar-EG") : "—"}</td>
                      <td className="py-3 px-5 text-center font-black text-[#D4AF37]">{Number(b.grossAmount || 0).toLocaleString()} ج.م</td>
                      <td className="py-3 px-5 text-center">
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 font-bold">{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Print Footer */}
        <div className="bg-[#111] rounded-2xl p-5 border border-[#D4AF37]/20 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award size={16} className="text-[#D4AF37]" />
            <span className="text-sm font-bold text-[#D4AF37]">Nooryi Studio — تقرير مالي معتمد</span>
          </div>
          <p className="text-xs text-gray-500">تم إصدار هذا التقرير تلقائياً من نظام Nooryi Studio • {reportDate}</p>
        </div>
      </div>

      
    </div>
  )
}
