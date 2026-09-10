import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ArtistReportClient from "./ArtistReportClient"
export const dynamic = "force-dynamic"
const CONFIRMED = ["CONFIRMED", "APPROVED", "ACCEPTED", "COMPLETED"]
export default async function ArtistReportPage({ params }: { params: Promise<{ artistId: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const role = (session.user as any).role || "USER"
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") redirect("/admin")
  const { artistId } = await params
  const artist: any = await prisma.artist.findUnique({ where: { id: artistId } }).catch(() => null)
  if (!artist) redirect("/admin/stats")
  const bookings: any[] = await prisma.booking.findMany({ where: { artistId }, include: { venue: { select: { name: true } } } }).catch(() => [])
  const ids = bookings.map(b => b.id)
  const payments: any[] = ids.length ? await prisma.payment.findMany({ where: { bookingId: { in: ids } } }).catch(() => []) : []
  const rating: any = await prisma.review.aggregate({ where: { artistId }, _avg: { rating: true }, _count: true }).catch(() => ({ _avg: { rating: 0 }, _count: 0 }))
  const up = (s: any) => String(s || "").toUpperCase()
  const confirmed = bookings.filter(b => CONFIRMED.includes(up(b.status)))
  const gross = confirmed.reduce((s, b) => s + Number(b.grossAmount || 0), 0)
  const rate = Number(artist.commissionRate ?? 15) || 15
  const commission = Math.round(gross * rate / 100)
  const paid = payments.filter(p => up(p.status) === "COMPLETED").reduce((s, p) => s + Number(p.amount || 0), 0)
  const rows = confirmed.slice().sort((a, b) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime()).slice(0, 12).map(b => ({ client: b.clientName || "عميل", date: b.date ? new Date(b.date).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" }) : "—", venue: b.venue?.name || "—", amount: Number(b.grossAmount || 0), status: b.status }))
  const data = {
    artist: { id: artist.id, name: artist.name, slug: artist.slug, category: artist.category || "فنان", commissionRate: rate },
    totals: { total: bookings.length, confirmed: confirmed.length, pending: bookings.filter(b => ["PENDING", "PENDING_APPROVAL"].includes(up(b.status))).length, completed: bookings.filter(b => up(b.status) === "COMPLETED").length, gross, commission, net: gross - commission, paid, rating: Number(rating._avg?.rating || 0), ratingCount: Number(rating._count || 0) },
    rows,
  }
  return <ArtistReportClient data={JSON.parse(JSON.stringify(data))} />
}
