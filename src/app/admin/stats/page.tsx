import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { TrendingUp, Wallet, CalendarCheck2, Percent, Music, Clock, CheckCircle2, XCircle, AlertCircle, ArrowLeft, Banknote } from "lucide-react"

export const dynamic = "force-dynamic"

const CONFIRMED = ["CONFIRMED", "APPROVED", "ACCEPTED", "COMPLETED"]
const MONTHS_AR = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"]

export default async function AdminStatsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/admin/stats")
  const role = (session.user as any).role || "USER"
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") redirect("/admin")

  // ═══ استعلامات محمية — لا تنهار أبداً ═══
  const bookings: any[] = await prisma.booking.findMany({ include: { artist: { select: { id: true, name: true, slug: true } } } }).catch(() => [])
  const payments: any[] = await prisma.payment.findMany().catch(() => [])

  let rateMap: Record<string, number> = {}
  try {
    const withRates: any = await (prisma.artist as any).findMany({ select: { id: true, commissionRate: true } })
    ;(withRates || []).forEach((a: any) => { rateMap[a.id] = Number(a.commissionRate ?? 15) || 15 })
  } catch {}

  const up = (s: any) => String(s || "").toUpperCase()
  const confirmed = bookings.filter(b => CONFIRMED.includes(up(b.status)))
  const pending = bookings.filter(b => ["PENDING", "PENDING_APPROVAL"].includes(up(b.status)))
  const completed = bookings.filter(b => up(b.status) === "COMPLETED")
  const rejected = bookings.filter(b => up(b.status) === "REJECTED")

  const gross = confirmed.reduce((s, b) => s + Number(b.grossAmount || 0), 0)
  const commission = confirmed.reduce((s, b) => s + (Number(b.grossAmount || 0) * (rateMap[b.artistId] ?? 15) / 100), 0)
  const net = gross - commission
  const paid = payments.filter(p => up(p.status) === "COMPLETED").reduce((s, p) => s + Number(p.amount || 0), 0)
  const avg = confirmed.length ? Math.round(gross / confirmed.length) : 0

  // ═══ الإيرادات الشهرية (آخر 6 أشهر) ═══
  const now = new Date()
  const months: { label: string; value: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.getFullYear() + "-" + d.getMonth()
    const value = confirmed.filter(b => {
      const bd = b.date ? new Date(b.date) : (b.createdAt ? new Date(b.createdAt) : null)
      if (!bd || isNaN(bd.getTime())) return false
      return bd.getFullYear() + "-" + bd.getMonth() === key
    }).reduce((s, b) => s + Number(b.grossAmount || 0), 0)
    months.push({ label: MONTHS_AR[d.getMonth()], value })
  }
  const maxMonth = Math.max(...months.map(m => m.value), 1)

  // ═══ أفضل الفنانين ═══
  const byArtist: Record<string, { name: string; slug: string; total: number; count: number }> = {}
  confirmed.forEach(b => {
    const id = b.artistId || "none"
    if (!byArtist[id]) byArtist[id] = { name: b.artist?.name || "غير معروف", slug: b.artist?.slug || "", total: 0, count: 0 }
    byArtist[id].total += Number(b.grossAmount || 0)
    byArtist[id].count += 1
  })
  const topArtists = Object.values(byArtist).sort((a, b) => b.total - a.total).slice(0, 5)
  const maxArtist = Math.max(...topArtists.map(a => a.total), 1)

  // ═══ آخر الدفعات ═══
  const bookingMap = new Map(bookings.map(b => [b.id, b]))
  const recentPayments = payments
    .slice()
    .sort((a, b) => new Date(b.confirmedAt || b.createdAt || 0).getTime() - new Date(a.confirmedAt || a.createdAt || 0).getTime())
    .slice(0, 8)

  const statusList = [
    { label: "مؤكدة", count: confirmed.length, color: "bg-[#22C55E]", text: "text-[#22C55E]" },
    { label: "قيد المراجعة", count: pending.length, color: "bg-[#F59E0B]", text: "text-[#F59E0B]" },
    { label: "مكتملة", count: completed.length, color: "bg-[#3B82F6]", text: "text-[#3B82F6]" },
    { label: "مرفوضة", count: rejected.length, color: "bg-[#EF4444]", text: "text-[#EF4444]" },
  ]
  const totalBookings = Math.max(bookings.length, 1)

  const kpis = [
    { label: "إجمالي الإيرادات", value: gross.toLocaleString() + " ج.م", sub: confirmed.length + " حجز مؤكد", icon: Wallet, color: "text-[#F5A623]", bg: "bg-[#F5A623]/10" },
    { label: "عمولة المنصة", value: Math.round(commission).toLocaleString() + " ج.م", sub: "صافي الفنان: " + Math.round(net).toLocaleString() + " ج.م", icon: Percent, color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" },
    { label: "المحصّل فعلياً", value: paid.toLocaleString() + " ج.م", sub: payments.length + " عملية دفع", icon: Banknote, color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
    { label: "متوسط قيمة الحجز", value: avg.toLocaleString() + " ج.م", sub: "لكل حجز مؤكد", icon: TrendingUp, color: "text-[#A855F7]", bg: "bg-[#A855F7]/10" },
  ]

  return (
    <div dir="rtl" className="space-y-6">
      {/* ═══ Header ═══ */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/25 text-[#F5A623] text-xs font-bold mb-2"><TrendingUp size={14} /> التقارير المالية</div>
          <h1 className="text-2xl md:text-3xl font-black text-white">نظرة عامة على الأداء</h1>
          <p className="text-gray-400 text-sm mt-1">إحصائيات الإيرادات والعمولات والدفعات</p>
        </div>
        <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm font-bold text-gray-300 hover:border-[#F5A623]/30 hover:text-[#F5A623] transition">
          <ArrowLeft size={16} /> عودة للوحة التحكم
        </Link>
      </div>

      {/* ═══ KPIs ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-4 md:p-5 hover:border-[#F5A623]/30 hover:-translate-y-1 transition-all duration-300 stagger-item">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] md:text-xs font-bold text-gray-400">{k.label}</span>
              <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center`}><k.icon size={16} className={k.color} /></div>
            </div>
            <p className="text-lg md:text-2xl font-black text-white">{k.value}</p>
            <p className="text-[10px] md:text-xs text-gray-500 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ═══ Monthly Chart ═══ */}
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-5 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-white flex items-center gap-2"><TrendingUp size={18} className="text-[#F5A623]" /> الإيرادات الشهرية</h2>
          <span className="text-xs text-gray-500">آخر 6 أشهر</span>
        </div>
        <div className="flex items-end justify-between gap-2 md:gap-4 h-48">
          {months.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-[10px] md:text-xs font-bold text-gray-400">{m.value > 0 ? m.value.toLocaleString() : ""}</span>
              <div className="w-full max-w-[60px] rounded-t-xl bg-gradient-to-t from-[#F5A623]/30 to-[#F5A623] transition-all duration-500 hover:from-[#F5A623]/50 hover:to-[#FFD700]" style={{ height: Math.max((m.value / maxMonth) * 100, 4) + "%" }}></div>
              <span className="text-[10px] md:text-xs font-bold text-gray-500">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        {/* ═══ Top Artists ═══ */}
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-5 md:p-6">
          <h2 className="text-lg font-black text-white flex items-center gap-2 mb-5"><Music size={18} className="text-[#F5A623]" /> أفضل الفنانين بالإيرادات</h2>
          {topArtists.length === 0 ? (
            <div className="text-center py-10"><Music className="mx-auto text-gray-600 mb-3" size={36} /><p className="text-gray-500 text-sm">لا توجد إيرادات بعد</p></div>
          ) : (
            <div className="space-y-4">
              {topArtists.map((a, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#F5A623]/10 text-[#F5A623] text-xs font-black flex items-center justify-center">{i + 1}</span>
                      <span className="text-sm font-bold text-white">{a.name}</span>
                      <span className="text-[10px] text-gray-500">({a.count} حجز)</span>
                    </div>
                    <span className="text-sm font-black text-[#F5A623]">{a.total.toLocaleString()} ج.م</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#2a2a2a] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-l from-[#F5A623] to-[#FFD700] transition-all duration-700" style={{ width: (a.total / maxArtist) * 100 + "%" }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═══ Status Breakdown ═══ */}
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-5 md:p-6">
          <h2 className="text-lg font-black text-white flex items-center gap-2 mb-5"><CalendarCheck2 size={18} className="text-[#F5A623]" /> توزيع حالات الحجوزات</h2>
          <div className="space-y-4">
            {statusList.map((s, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-gray-300 flex items-center gap-2">
                    {s.label === "مؤكدة" && <CheckCircle2 size={14} className={s.text} />}
                    {s.label === "قيد المراجعة" && <Clock size={14} className={s.text} />}
                    {s.label === "مكتملة" && <CheckCircle2 size={14} className={s.text} />}
                    {s.label === "مرفوضة" && <XCircle size={14} className={s.text} />}
                    {s.label}
                  </span>
                  <span className={`text-sm font-black ${s.text}`}>{s.count}</span>
                </div>
                <div className="h-2 rounded-full bg-[#2a2a2a] overflow-hidden">
                  <div className={`h-full rounded-full ${s.color} transition-all duration-700`} style={{ width: (s.count / totalBookings) * 100 + "%" }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-[#2a2a2a] flex items-center justify-between">
            <span className="text-sm text-gray-400">إجمالي الحجوزات</span>
            <span className="text-lg font-black text-white">{bookings.length}</span>
          </div>
        </div>
      </div>

      {/* ═══ Recent Payments ═══ */}
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-5 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-white flex items-center gap-2"><Banknote size={18} className="text-[#F5A623]" /> آخر الدفعات</h2>
          <span className="text-xs text-gray-500">{payments.length} عملية</span>
        </div>
        {recentPayments.length === 0 ? (
          <div className="text-center py-10"><Banknote className="mx-auto text-gray-600 mb-3" size={36} /><p className="text-gray-500 text-sm">لا توجد دفعات مسجلة بعد</p></div>
        ) : (
          <div className="space-y-2">
            {recentPayments.map((p: any) => {
              const b: any = bookingMap.get(p.bookingId)
              return (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#1a1a1a] transition">
                  <div className="w-9 h-9 rounded-xl bg-[#22C55E]/10 flex items-center justify-center flex-shrink-0"><Banknote size={16} className="text-[#22C55E]" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{b?.clientName || b?.artist?.name || "دفعة"}</p>
                    <p className="text-[10px] text-gray-500 truncate">{b?.artist?.name || "—"} • {p.confirmedAt || p.createdAt ? new Date(p.confirmedAt || p.createdAt).toLocaleDateString("ar-EG") : "—"}</p>
                  </div>
                  <span className="text-sm font-black text-[#22C55E]">+{Number(p.amount || 0).toLocaleString()} ج.م</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}