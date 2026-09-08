import { getManagerArtist } from "@/lib/managerAuth"
import { prisma } from "@/lib/prisma"
import StatsClient from "./StatsClient"

export const dynamic = "force-dynamic"

export default async function ArtistStats({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { artist } = await getManagerArtist(slug)

  const [total, confirmed, revenue, avgRating, recent] = await Promise.all([
    prisma.booking.count({ where: { artistId: artist.id } }),
    prisma.booking.count({ where: { artistId: artist.id, status: { in: ["CONFIRMED","APPROVED","ACCEPTED","COMPLETED"] } } }),
    prisma.booking.aggregate({ where: { artistId: artist.id, status: { in: ["CONFIRMED","COMPLETED","APPROVED"] } }, _sum: { grossAmount: true } }),
    prisma.review.aggregate({ where: { artistId: artist.id }, _avg: { rating: true }, _count: true }).catch(() => ({ _avg: { rating: 0 }, _count: 0 })),
    prisma.booking.findMany({ where: { artistId: artist.id, status: { in: ["CONFIRMED","COMPLETED","APPROVED"] } }, orderBy: { date: "desc" }, take: 10, select: { id:true,date:true,clientName:true,grossAmount:true,status:true } }),
  ])

  const rev = Number(revenue._sum?.grossAmount || 0)
  const comm = Number((artist as any).commissionRate || 15)

  return <StatsClient data={JSON.parse(JSON.stringify({
    total, confirmed, revenue: rev, commission: comm,
    net: rev - rev*comm/100, rating: avgRating._avg?.rating||0,
    ratingCount: (avgRating as any)._count||0, recent,
    artistName: artist.name,
    date: new Date().toLocaleDateString("ar-EG",{year:"numeric",month:"long",day:"numeric"})
  }))} />
}