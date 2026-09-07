import { getManagerArtist } from "@/lib/managerAuth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Calendar, DollarSign, Star, TrendingUp, Music, Clock } from "lucide-react"

export default async function ArtistDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { artist } = await getManagerArtist(slug)

  const [bookingsCount, pendingCount, reviewsAvg, monthRevenue] = await Promise.all([
    prisma.booking.count({ where: { artistId: artist.id } }),
    prisma.booking.count({ where: { artistId: artist.id, status: "PENDING_APPROVAL" } }),
    prisma.review.aggregate({ where: { artistId: artist.id }, _avg: { rating: true } }),
    prisma.booking.aggregate({
      where: { artistId: artist.id, status: { in: ["CONFIRMED", "COMPLETED"] }, date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
      _sum: { grossAmount: true },
    }),
  ])

  const recentBookings = await prisma.booking.findMany({
    where: { artistId: artist.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { customer: true },
  })

  const stats = [
    { label: "إجمالي الحجوزات", value: bookingsCount.toString(), icon: Calendar, color: "from-blue-500 to-blue-700" },
    { label: "بانتظار الموافقة", value: pendingCount.toString(), icon: Clock, color: "from-yellow-500 to-yellow-700" },
    { label: "متوسط التقييم", value: (reviewsAvg._avg.rating || 0).toFixed(1), icon: Star, color: "from-[#D4AF37] to-[#b8941f]" },
    { label: "إيرادات الشهر", value: (monthRevenue._sum.grossAmount || 0).toLocaleString() + " ج.م", icon: DollarSign, color: "from-green-500 to-green-700" },
  ]

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center gap-4">
        {artist.profileImage ? (
          <img src={artist.profileImage} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-[#D4AF37]" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center">
            <Music size={28} className="text-[#111]" />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">{artist.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">{artist.category || "فنان"} • لوحة التحكم</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-[#111] rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
              <s.icon size={18} className="text-white" />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-900 dark:text-white">آخر الحجوزات</h2>
          <Link href={`/admin/artist/${slug}/bookings`} className="text-sm text-[#b8941f] font-bold hover:underline">عرض الكل ←</Link>
        </div>
        {recentBookings.length === 0 ? (
          <p className="p-8 text-center text-gray-400">لا توجد حجوزات بعد</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentBookings.map((b: any) => (
              <div key={b.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{b.clientName}</p>
                  <p className="text-xs text-gray-500">{new Date(b.date).toLocaleDateString("ar-EG")} • {b.timeSlot}</p>
                </div>
                <div className="text-left">
                  <p className="font-bold text-[#D4AF37]">{Number(b.grossAmount || 0).toLocaleString()} ج.م</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${b.status === "CONFIRMED" || b.status === "COMPLETED" ? "bg-green-100 text-green-700" : b.status === "PENDING_APPROVAL" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
                    {b.status === "CONFIRMED" ? "مؤكد" : b.status === "PENDING_APPROVAL" ? "بانتظار" : b.status === "COMPLETED" ? "مكتمل" : b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}