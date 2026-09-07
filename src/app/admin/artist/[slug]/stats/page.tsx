import { getManagerArtist } from "@/lib/managerAuth"
import { prisma } from "@/lib/prisma"
import { TrendingUp, DollarSign, Calendar, Star } from "lucide-react"

export default async function ArtistStats({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { artist } = await getManagerArtist(slug)

  const [total, confirmed, revenue, avgRating] = await Promise.all([
    prisma.booking.count({ where: { artistId: artist.id } }),
    prisma.booking.count({ where: { artistId: artist.id, status: { in: ["CONFIRMED", "COMPLETED"] } } }),
    prisma.booking.aggregate({ where: { artistId: artist.id, status: { in: ["CONFIRMED", "COMPLETED"] } }, _sum: { grossAmount: true } }),
    prisma.review.aggregate({ where: { artistId: artist.id }, _avg: { rating: true }, _count: true }),
  ])

  const conversionRate = total > 0 ? ((confirmed / total) * 100).toFixed(0) : "0"

  return (
    <div dir="rtl" className="space-y-6">
      <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2"><TrendingUp size={28} className="text-[#D4AF37]" /> تقارير {artist.name}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الحجوزات", value: total.toString(), icon: Calendar, color: "from-blue-500 to-blue-700" },
          { label: "حجوزات مؤكدة", value: confirmed.toString(), icon: Star, color: "from-green-500 to-green-700" },
          { label: "إجمالي الإيرادات", value: (revenue._sum.grossAmount || 0).toLocaleString() + " ج.م", icon: DollarSign, color: "from-[#D4AF37] to-[#b8941f]" },
          { label: "معدل التحويل", value: conversionRate + "%", icon: TrendingUp, color: "from-purple-500 to-purple-700" },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-[#111] rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}><s.icon size={18} className="text-white" /></div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="font-black text-gray-900 dark:text-white mb-4">التقييمات</h3>
        <div className="flex items-center gap-4">
          <span className="text-4xl font-black text-[#D4AF37]">{(avgRating._avg.rating || 0).toFixed(1)}</span>
          <div>
            <div className="flex gap-1">{[1,2,3,4,5].map(i => <Star key={i} size={16} className={i <= Math.round(avgRating._avg.rating || 0) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-300"} />)}</div>
            <p className="text-xs text-gray-500 mt-1">{avgRating._count} تقييم</p>
          </div>
        </div>
      </div>
    </div>
  )
}