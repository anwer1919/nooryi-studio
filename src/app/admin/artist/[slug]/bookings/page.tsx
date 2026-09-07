import { getManagerArtist } from "@/lib/managerAuth"
import { prisma } from "@/lib/prisma"
import { Calendar, CheckCircle2, XCircle, Clock } from "lucide-react"

export default async function ArtistBookings({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { artist } = await getManagerArtist(slug)

  const bookings = await prisma.booking.findMany({
    where: { artistId: artist.id },
    orderBy: { date: "desc" },
    include: { customer: true },
  })

  return (
    <div dir="rtl" className="space-y-6">
      <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2"><Calendar size={28} className="text-[#D4AF37]" /> حجوزات {artist.name}</h1>
      <p className="text-gray-500">{bookings.length} حجز</p>

      <div className="space-y-3">
        {bookings.map((b: any) => (
          <div key={b.id} className="bg-white dark:bg-[#111] rounded-2xl p-5 border border-gray-200 dark:border-gray-800 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-black text-gray-900 dark:text-white">{b.clientName}</p>
              <p className="text-sm text-gray-500">{new Date(b.date).toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
              <p className="text-xs text-gray-400 mt-1">{b.timeSlot} • {b.clientPhone}</p>
            </div>
            <div className="text-left flex items-center gap-3">
              <p className="font-black text-[#D4AF37] text-lg">{Number(b.grossAmount || 0).toLocaleString()} ج.م</p>
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${b.status === "CONFIRMED" || b.status === "COMPLETED" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : b.status === "PENDING_APPROVAL" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" : b.status === "REJECTED" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
                {b.status === "CONFIRMED" ? "✅ مؤكد" : b.status === "PENDING_APPROVAL" ? "⏳ بانتظار" : b.status === "COMPLETED" ? "✅ مكتمل" : b.status === "REJECTED" ? "❌ مرفوض" : b.status}
              </span>
            </div>
          </div>
        ))}
        {bookings.length === 0 && <p className="text-center py-12 text-gray-400">لا توجد حجوزات</p>}
      </div>
    </div>
  )
}