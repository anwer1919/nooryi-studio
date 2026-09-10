import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { TrendingUp, Wallet, Percent, Banknote, Music, ArrowLeft } from "lucide-react"
export const dynamic = "force-dynamic"
const CONFIRMED = ["CONFIRMED", "APPROVED", "ACCEPTED", "COMPLETED"]
export default async function AdminStatsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/admin/stats")
  const role = (session.user as any).role || "USER"
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") redirect("/admin")
  const bookings: any[] = await prisma.booking.findMany({ include: { artist: { select: { id: true, name: true, slug: true, category: true } } } }).catch(() => [])
  const payments: any[] = await prisma.payment.findMany().catch(() => [])
  const artists: any[] = await prisma.artist.findMany({ select: { id: true, name: true, slug: true, category: true } }).catch(() => [])
  const up = (s: any) => String(s || "").toUpperCase()
  const confirmed = bookings.filter(b => CONFIRMED.includes(up(b.status)))
  const gross = confirmed.reduce((s, b) => s + Number(b.grossAmount || 0), 0)
  const commission = confirmed.reduce((s, b) => s + Number(b.grossAmount || 0) * 0.15, 0)
  const paid = payments.filter(p => up(p.status) === "COMPLETED").reduce((s, p) => s + Number(p.amount || 0), 0)
  const perArtist = artists.map(a => { const ab = bookings.filter(b => b.artistId === a.id); const ac = ab.filter(b => CONFIRMED.includes(up(b.status))); return { id: a.id, name: a.name, slug: a.slug, category: a.category || "فنان", total: ab.length, confirmed: ac.length, revenue: ac.reduce((s, b) => s + Number(b.grossAmount || 0), 0) } }).sort((x, y) => y.revenue - x.revenue)
  const kpis = [
    { label: "إجمالي الإيرادات", value: gross.toLocaleString() + " ج.م", icon: Wallet, color: "text-[#F5A623]", bg: "bg-[#F5A623]/10" },
    { label: "عمولة المنصة (15%)", value: Math.round(commission).toLocaleString() + " ج.م", icon: Percent, color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" },
    { label: "المحصّل فعلياً", value: paid.toLocaleString() + " ج.م", icon: Banknote, color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
    { label: "حجوزات مؤكدة", value: String(confirmed.length), icon: TrendingUp, color: "text-[#A855F7]", bg: "bg-[#A855F7]/10" },
  ]
  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl md:text-3xl font-black text-fg">التقارير المالية</h1><p className="text-muted text-sm mt-1">نظرة عامة + تقرير شامل لكل فنان على حدة</p></div>
        <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 bg-card border border-line rounded-xl text-sm font-bold text-muted hover:border-[#F5A623]/30 hover:text-[#F5A623] transition"><ArrowLeft size={16} /> عودة</Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="bg-card border border-line rounded-2xl p-4 md:p-5 hover:border-[#F5A623]/30 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3"><span className="text-[10px] md:text-xs font-bold text-muted">{k.label}</span><div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center`}><k.icon size={16} className={k.color} /></div></div>
            <p className="text-lg md:text-2xl font-black text-white">{k.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-line rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-line flex items-center gap-2"><Music size={18} className="text-[#F5A623]" /><h2 className="text-lg font-black text-fg">تقارير الفنانين</h2><span className="text-xs text-muted">({perArtist.length} فنان)</span></div>
        {perArtist.length === 0 ? (<div className="text-center py-12"><Music className="mx-auto text-muted mb-3" size={36} /><p className="text-muted text-sm">لا يوجد فنانين</p></div>) : (
          <div className="divide-y divide-line">
            {perArtist.map(a => (
              <div key={a.id} className="flex items-center gap-3 md:gap-4 p-4 hover:bg-card transition">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center text-fg font-black flex-shrink-0">{a.name.charAt(0)}</div>
                <div className="flex-1 min-w-0"><p className="font-bold text-fg text-sm truncate">{a.name}</p><p className="text-[10px] md:text-xs text-muted truncate">{a.category} • {a.total} حجز • {a.confirmed} مؤكد</p></div>
                <div className="text-left flex-shrink-0"><p className="text-sm md:text-base font-black text-[#F5A623]">{a.revenue.toLocaleString()} ج.م</p></div>
                <Link href={"/admin/stats/" + a.id} className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-[#F5A623] text-[#0a0a0a] rounded-xl text-xs font-black hover:bg-[#E8961A] transition flex-shrink-0 active:scale-[0.97]"><span className="hidden md:inline">عرض التقرير</span><span className="md:hidden">التقرير</span></Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
