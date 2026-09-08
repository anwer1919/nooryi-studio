import { getManagerArtist } from "@/lib/managerAuth"
import { prisma } from "@/lib/prisma"
import { TrendingUp, Printer } from "lucide-react"
import StatsClient from "./StatsClient"

export const dynamic = "force-dynamic"

export default async function ArtistStats({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { artist } = await getManagerArtist(slug)

  const [total, confirmed, revenue, avgRating, recent] = await Promise.all([
    prisma.booking.count({ where: { artistId: artist.id } }),
    prisma.booking.count({ where: { artistId: artist.id, status: { in: ["CONFIRMED","APPROVED","ACCEPTED","COMPLETED"] } } }),
    prisma.booking.aggregate({ where: { artistId: artist.id, status: { in: ["CONFIRMED","COMPLETED","APPROVED","ACCEPTED"] } }, _sum: { grossAmount: true } }),
    prisma.review.aggregate({ where: { artistId: artist.id }, _avg: { rating: true }, _count: true }).catch(() => ({ _avg: { rating: 0 }, _count: 0 })),
    prisma.booking.findMany({ where: { artistId: artist.id, status: { in: ["CONFIRMED","COMPLETED","APPROVED"] } }, orderBy: { date: "desc" }, take: 10, select: { id:true,date:true,clientName:true,grossAmount:true,status:true } }),
  ])

  const rev = Number(revenue._sum?.grossAmount || 0)
  const comm = Number((artist as any).commissionRate || 15)
  const data = { total, confirmed, revenue: rev, commission: comm, net: rev - rev*comm/100, rating: avgRating._avg?.rating||0, ratingCount: avgRating._count||0, recent: JSON.parse(JSON.stringify(recent)), artistName: artist.name, date: new Date().toLocaleDateString("ar-EG",{year:"numeric",month:"long",day:"numeric"}) }

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4 no-print">
        <div><h1 className="text-3xl font-black text-white flex items-center gap-2"><TrendingUp size={28} className="text-[#D4AF37]"/> التقرير المالي — {artist.name}</h1><p className="text-gray-400 text-sm mt-1">{data.date}</p></div>
        <button onClick={()=>window.print()} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] rounded-xl font-black text-sm hover:shadow-lg"><Printer size={16}/> طباعة</button>
      </div>
      <StatsClient data={data} />
    </div>
  )
}