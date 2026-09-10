import { getManagerArtist } from "@/lib/managerAuth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Calendar, Eye, DollarSign, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ArtistBookings({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { artist } = await getManagerArtist(slug)

  const bookings = await prisma.booking.findMany({
    where: { artistId: artist.id },
    orderBy: { date: "desc" },
    include: { venue: { select: { name: true } } },
  })

  const gs = (s: string) => {
    const u = (s||"").toUpperCase()
    if (["CONFIRMED","APPROVED","ACCEPTED"].includes(u)) return { l:"مؤكد", c:"bg-green-500/20 text-green-400 border-green-500/30" }
    if (["PENDING_APPROVAL","PENDING"].includes(u)) return { l:"بانتظار", c:"bg-yellow-500/20 text-yellow-400 border-yellow-500/30" }
    if (["COMPLETED","DONE"].includes(u)) return { l:"مكتمل", c:"bg-blue-500/20 text-blue-400 border-blue-500/30" }
    return { l:"مرفوض", c:"bg-red-500/20 text-red-400 border-red-500/30" }
  }

  const pending = bookings.filter(b=>["PENDING_APPROVAL","PENDING"].includes((b.status||"").toUpperCase())).length
  const confirmed = bookings.filter(b=>["CONFIRMED","APPROVED","ACCEPTED","COMPLETED"].includes((b.status||"").toUpperCase())).length
  const revenue = bookings.filter(b=>["CONFIRMED","APPROVED","COMPLETED"].includes((b.status||"").toUpperCase())).reduce((s,b)=>s+Number(b.grossAmount||0),0)

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <div className="badge-gold mb-3">حجوزات الفنان</div>
        <h1 className="text-3xl font-black text-white flex items-center gap-2"><Calendar size={28} className="text-[#F5A623]"/> حجوزات {artist.name}</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111] rounded-2xl p-5 border border-[#F5A623]/20"><p className="text-xs text-gray-400 mb-1">الإجمالي</p><p className="text-2xl font-black text-white">{bookings.length}</p></div>
        <div className="bg-[#111] rounded-2xl p-5 border border-yellow-500/20"><p className="text-xs text-gray-400 mb-1">بانتظار</p><p className="text-2xl font-black text-yellow-400">{pending}</p></div>
        <div className="bg-[#111] rounded-2xl p-5 border border-green-500/20"><p className="text-xs text-gray-400 mb-1">مؤكدة</p><p className="text-2xl font-black text-green-400">{confirmed}</p></div>
        <div className="bg-[#111] rounded-2xl p-5 border border-[#F5A623]/20"><p className="text-xs text-gray-400 mb-1">الإيرادات</p><p className="text-xl font-black text-[#F5A623]">{revenue.toLocaleString()} <span className="text-xs">ج.م</span></p></div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-[#111] rounded-2xl p-12 text-center border border-[#F5A623]/20"><Calendar className="mx-auto text-gray-600 mb-4" size={48}/><p className="text-gray-400">لا توجد حجوزات</p></div>
      ) : (
        <div className="bg-[#111] rounded-2xl border border-[#F5A623]/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead><tr className="border-b border-[#F5A623]/20 bg-[#0a0a0a]">
                <th className="text-right py-3 px-4 text-xs font-bold text-[#F5A623] uppercase">العميل</th>
                <th className="text-center py-3 px-4 text-xs font-bold text-[#F5A623] uppercase">التاريخ</th>
                <th className="text-center py-3 px-4 text-xs font-bold text-[#F5A623] uppercase">الوقت</th>
                <th className="text-center py-3 px-4 text-xs font-bold text-[#F5A623] uppercase">المكان</th>
                <th className="text-center py-3 px-4 text-xs font-bold text-[#F5A623] uppercase">المبلغ</th>
                <th className="text-center py-3 px-4 text-xs font-bold text-[#F5A623] uppercase">الحالة</th>
                <th className="text-center py-3 px-4 text-xs font-bold text-[#F5A623] uppercase">عرض</th>
              </tr></thead>
              <tbody>{bookings.map((b:any)=>{
                const s=gs(b.status)
                return (<tr key={b.id} className="border-b border-[#F5A623]/5 hover:bg-[#1a1a1a] transition">
                  <td className="py-3 px-4"><p className="font-bold text-white">{b.clientName}</p><p className="text-xs text-gray-500">{b.clientPhone}</p></td>
                  <td className="py-3 px-4 text-center text-gray-300 text-sm">{b.date?new Date(b.date).toLocaleDateString("ar-EG"):"—"}</td>
                  <td className="py-3 px-4 text-center text-gray-400 text-sm">{b.timeSlot||"—"}</td>
                  <td className="py-3 px-4 text-center text-gray-400 text-sm">{b.venue?.name||"—"}</td>
                  <td className="py-3 px-4 text-center font-black text-[#F5A623]">{Number(b.grossAmount||0).toLocaleString()} ج.م</td>
                  <td className="py-3 px-4 text-center"><span className={"text-xs px-3 py-1 rounded-full font-bold border "+s.c}>{s.l}</span></td>
                  <td className="py-3 px-4 text-center"><Link href={"/admin/bookings/"+b.id} className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F5A623]/10 text-[#F5A623] rounded-lg text-xs font-bold hover:bg-[#F5A623]/20 transition"><Eye size={14}/> عرض</Link></td>
                </tr>)
              })}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}