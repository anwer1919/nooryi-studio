import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Music, Calendar, Users, Sparkles, ArrowLeft, Clock, UserPlus, TrendingUp } from "lucide-react"
export const dynamic = "force-dynamic"
export default async function AdminDashboard() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const role = (session.user as any).role || "USER"
  const isManager = role === "ARTIST_MANAGER"
  const [artistsCount, bookingsCount, usersCount, customersCount, revenueResult, recentBookings] = await Promise.all([
    prisma.artist.count().catch(() => 0), prisma.booking.count().catch(() => 0),
    prisma.user.count({ where: { role: "USER" } }).catch(() => 0), prisma.customer.count().catch(() => 0),
    prisma.booking.aggregate({ _sum: { grossAmount: true }, where: { status: { in: ["CONFIRMED","APPROVED","ACCEPTED","COMPLETED"] } } }).catch(() => ({ _sum: { grossAmount: 0 } })),
    prisma.booking.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { artist: { select: { name: true } }, customer: { select: { fullName: true } }, user: { select: { name: true } } } }).catch(() => []),
  ])
  const stats = [{ icon: Music, label: "الفنانين", value: artistsCount, accent: "gold" }, { icon: Calendar, label: "الحجوزات", value: bookingsCount, accent: "dark" }, { icon: Users, label: "المستخدمين", value: usersCount, accent: "gold" }, { icon: UserPlus, label: "العملاء", value: customersCount, accent: "dark" }]
  const revenue = revenueResult._sum.grossAmount || 0
  const quickLinks = [{ icon: Music, label: "الفنانين", href: "/admin/artists", desc: "إدارة ملفات الفنانين" }, { icon: Calendar, label: "الحجوزات", href: "/admin/bookings", desc: "متابعة كل الحجوزات" }, { icon: Users, label: "المستخدمين", href: "/admin/users", desc: "المستخدمون والعملاء" }, { icon: TrendingUp, label: "التقارير", href: "/admin/stats", desc: "الإحصائيات المالية" }]
  const gs = (s: string) => { const u = (s||"").toUpperCase(); if (["CONFIRMED","APPROVED","ACCEPTED"].includes(u)) return { label: "مؤكد", class: "status-confirmed" }; if (["PENDING_APPROVAL","PENDING"].includes(u)) return { label: "بانتظار", class: "status-pending" }; if (["COMPLETED","DONE"].includes(u)) return { label: "مكتمل", class: "status-completed" }; return { label: "مرفوض", class: "status-rejected" } }
  return (
    <div dir="rtl" className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="badge-gold mb-2"><Sparkles size={12}/> لوحة التحكم</div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-white">أهلاً، <span className="gold-text">{(session.user as any).name || "المدير"}</span></h1>
          <p className="text-gray-400 mt-1 text-xs md:text-sm">الإيرادات: <span className="font-black gold-text">{revenue.toLocaleString()} ج.م</span></p>
        </div>
        {!isManager && <Link href="/admin/artists/new" className="btn-gold text-xs md:text-sm py-2 px-3 md:px-4"><Sparkles size={14}/> إضافة فنان</Link>}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        {stats.map((s, i) => (<div key={i} className={`stat-card ${s.accent === "dark" ? "dark" : ""}`}><div className="flex items-center justify-between mb-2"><span className="stat-label text-[9px] md:text-[10px]">{s.label}</span><s.icon size={14} className={s.accent === "dark" ? "text-[#F5A623]" : "text-[#E8961A]"}/></div><div className="stat-value text-lg md:text-xl lg:text-2xl">{s.value}</div></div>))}
      </div>
      <div className="grid lg:grid-cols-3 gap-3 md:gap-4">
        <div className="lg:col-span-1 card-pro p-4 md:p-5">
          <h2 className="text-base md:text-lg font-black text-white mb-3 md:mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-[#E8961A]"/> روابط سريعة</h2>
          <div className="space-y-1">
            {quickLinks.map((q, i) => (<Link key={i} href={q.href} className="flex items-center gap-2.5 p-2 md:p-2.5 rounded-lg hover:bg-[#1a1a1a] transition group"><div className="icon-circle dark w-8 h-8"><q.icon size={14}/></div><div className="flex-1 min-w-0"><p className="font-bold text-white text-xs md:text-sm group-hover:text-[#E8961A] transition">{q.label}</p><p className="text-[9px] md:text-[10px] text-gray-500 truncate">{q.desc}</p></div><ArrowLeft size={12} className="text-gray-600 group-hover:text-[#E8961A] transition flex-shrink-0"/></Link>))}
          </div>
        </div>
        <div className="lg:col-span-2 card-pro p-4 md:p-5">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-base md:text-lg font-black text-white flex items-center gap-2"><Clock size={16} className="text-[#E8961A]"/> آخر الحجوزات</h2>
            <Link href="/admin/bookings" className="text-[10px] md:text-xs font-bold text-[#E8961A] hover:text-[#F5A623] transition">عرض الكل</Link>
          </div>
          {recentBookings.length === 0 ? (<div className="text-center py-8 md:py-10"><Calendar className="mx-auto text-gray-600 mb-2" size={32}/><p className="text-gray-500 text-xs">لا توجد حجوزات بعد</p></div>) : (
            <div className="space-y-1">
              {recentBookings.map((b: any) => { const status = gs(b.status); const client = b.user?.name || b.customer?.fullName || b.clientName || "عميل"; return (<Link key={b.id} href={"/admin/bookings/" + b.id} className="flex items-center gap-2.5 md:gap-3 p-2 md:p-2.5 rounded-lg hover:bg-[#1a1a1a] transition"><div className="icon-circle dark w-8 h-8"><Music size={14}/></div><div className="flex-1 min-w-0"><p className="font-bold text-white text-xs md:text-sm truncate">{b.artist?.name || "فنان"}</p><p className="text-[9px] md:text-[10px] text-gray-500 truncate">{client} • {b.date ? new Date(b.date).toLocaleDateString("ar-EG") : "—"}</p></div><span className={"status-chip text-[9px] " + status.class}>{status.label}</span></Link>) })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}