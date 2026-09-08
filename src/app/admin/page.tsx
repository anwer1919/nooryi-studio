import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Music, Calendar, Users, DollarSign, TrendingUp, Sparkles, ArrowLeft, Clock, UserPlus } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = (session.user as any).role || "USER"
  const isManager = role === "ARTIST_MANAGER"

  const [artistsCount, bookingsCount, usersCount, customersCount, revenueResult, recentBookings] = await Promise.all([
    prisma.artist.count().catch(() => 0),
    prisma.booking.count().catch(() => 0),
    prisma.user.count({ where: { role: "USER" } }).catch(() => 0),
    prisma.customer.count().catch(() => 0),
    prisma.booking.aggregate({ _sum: { grossAmount: true }, where: { status: { in: ["CONFIRMED","APPROVED","ACCEPTED","COMPLETED"] } } }).catch(() => ({ _sum: { grossAmount: 0 } })),
    prisma.booking.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { artist: { select: { name: true } }, customer: { select: { fullName: true } }, user: { select: { name: true } } } }).catch(() => []),
  ])

  const stats = [
    { icon: Music, label: "الفنانين", value: artistsCount, accent: "gold" },
    { icon: Calendar, label: "الحجوزات", value: bookingsCount, accent: "dark" },
    { icon: Users, label: "المستخدمين", value: usersCount, accent: "gold" },
    { icon: UserPlus, label: "العملاء", value: customersCount, accent: "dark" },
  ]

  const revenue = revenueResult._sum.grossAmount || 0

  const quickLinks = [
    { icon: Music, label: "الفنانين", href: "/admin/artists", desc: "إدارة ملفات الفنانين" },
    { icon: Calendar, label: "الحجوزات", href: "/admin/bookings", desc: "متابعة كل الحجوزات" },
    { icon: Users, label: "المستخدمين", href: "/admin/users", desc: "المستخدمون والعملاء" },
    { icon: TrendingUp, label: "التقارير", href: "/admin/stats", desc: "الإحصائيات المالية" },
  ]

  const getStatusLabel = (s: string) => {
    const u = (s || "").toUpperCase()
    if (["CONFIRMED","APPROVED","ACCEPTED"].includes(u)) return { label: "مؤكد", class: "status-confirmed" }
    if (["PENDING_APPROVAL","PENDING"].includes(u)) return { label: "قيد المراجعة", class: "status-pending" }
    if (["COMPLETED","DONE"].includes(u)) return { label: "مكتمل", class: "status-completed" }
    return { label: "مرفوض", class: "status-rejected" }
  }

  return (
    <div dir="rtl" className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="badge-gold mb-2"><Sparkles size={14} /> لوحة التحكم</div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white">أهلاً، <span className="gold-text">{(session.user as any).name || "المدير"}</span></h1>
          <p className="text-gray-400 mt-1 text-sm md:text-base">إجمالي الإيرادات: <span className="font-black gold-text">{revenue.toLocaleString()} ج.م</span></p>
        </div>
        {!isManager && <Link href="/admin/artists/new" className="btn-gold text-sm py-2.5 px-4"><Sparkles size={16} /> إضافة فنان</Link>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s, i) => (
          <div key={i} className={`stat-card ${s.accent === "dark" ? "dark" : ""}`}>
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <span className="stat-label text-[10px] md:text-xs">{s.label}</span>
              <s.icon size={18} className={s.accent === "dark" ? "text-[#D4AF37]" : "text-[#b8941f]"} />
            </div>
            <div className="stat-value text-xl md:text-2xl lg:text-3xl">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Links + Recent Bookings */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-1 card-pro p-5 md:p-6">
          <h2 className="text-lg md:text-xl font-black text-white mb-4 md:mb-5 flex items-center gap-2"><TrendingUp size={18} className="text-[#b8941f]" /> روابط سريعة</h2>
          <div className="space-y-1.5 md:space-y-2">
            {quickLinks.map((q, i) => (
              <Link key={i} href={q.href} className="flex items-center gap-3 p-2.5 md:p-3 rounded-xl hover:bg-[#1a1a1a] transition group">
                <div className="icon-circle dark"><q.icon size={16} /></div>
                <div className="flex-1 min-w-0"><p className="font-bold text-white text-sm group-hover:text-[#b8941f] transition">{q.label}</p><p className="text-[10px] md:text-xs text-gray-500 truncate">{q.desc}</p></div>
                <ArrowLeft size={14} className="text-gray-600 group-hover:text-[#b8941f] transition flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 card-pro p-5 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-5">
            <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2"><Clock size={18} className="text-[#b8941f]" /> آخر الحجوزات</h2>
            <Link href="/admin/bookings" className="text-xs md:text-sm font-bold text-[#b8941f] hover:text-[#D4AF37] transition">عرض الكل</Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="text-center py-10 md:py-12"><Calendar className="mx-auto text-gray-600 mb-3" size={36} /><p className="text-gray-500 text-sm">لا توجد حجوزات بعد</p></div>
          ) : (
            <div className="space-y-1.5 md:space-y-2">
              {recentBookings.map((b: any) => {
                const status = getStatusLabel(b.status)
                const client = b.user?.name || b.customer?.fullName || b.clientName || "عميل"
                return (
                  <Link key={b.id} href={"/admin/bookings/" + b.id} className="flex items-center gap-3 md:gap-4 p-2.5 md:p-3 rounded-xl hover:bg-[#1a1a1a] transition">
                    <div className="icon-circle dark"><Music size={16} /></div>
                    <div className="flex-1 min-w-0"><p className="font-bold text-white text-sm truncate">{b.artist?.name || "فنان"}</p><p className="text-[10px] md:text-xs text-gray-500 truncate">{client} • {b.date ? new Date(b.date).toLocaleDateString("ar-EG") : "—"}</p></div>
                    <span className={"status-chip " + status.class}>{status.label}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}