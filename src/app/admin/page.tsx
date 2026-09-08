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
    prisma.booking.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { artist: { select: { name: true } }, customer: { select: { fullName: true } } } }).catch(() => []),
  ])

  const revenue = revenueResult._sum.grossAmount || 0

  const stats = [
    { icon: Music, label: "الفنانين", value: artistsCount, gradient: "from-[#D4AF37] to-[#b8941f]", text: "text-[#0a0a0a]" },
    { icon: Calendar, label: "الحجوزات", value: bookingsCount, gradient: "from-[#111] to-[#232323]", text: "text-[#D4AF37]" },
    { icon: Users, label: "المستخدمين", value: usersCount, gradient: "from-[#111] to-[#232323]", text: "text-[#D4AF37]" },
    { icon: UserPlus, label: "العملاء", value: customersCount, gradient: "from-[#D4AF37] to-[#b8941f]", text: "text-[#0a0a0a]" },
  ]

  const quickLinks = [
    { icon: Music, label: "الفنانين", href: "/admin/artists", desc: "إدارة ملفات الفنانين" },
    { icon: Calendar, label: "الحجوزات", href: "/admin/bookings", desc: "متابعة كل الحجوزات" },
    { icon: Users, label: "المستخدمين", href: "/admin/users", desc: "المستخدمون والعملاء" },
    { icon: TrendingUp, label: "التقارير", href: "/admin/stats", desc: "الإحصائيات المالية" },
  ]

  const gs = (s: string) => {
    const u = (s || "").toUpperCase()
    if (["CONFIRMED","APPROVED","ACCEPTED"].includes(u)) return { l: "مؤكد", c: "bg-green-100 text-green-700 border-green-200" }
    if (["PENDING_APPROVAL","PENDING"].includes(u)) return { l: "بانتظار", c: "bg-yellow-100 text-yellow-700 border-yellow-200" }
    if (["COMPLETED","DONE"].includes(u)) return { l: "مكتمل", c: "bg-blue-100 text-blue-700 border-blue-200" }
    return { l: "مرفوض", c: "bg-red-100 text-red-700 border-red-200" }
  }

  return (
    <div dir="rtl" className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="badge-gold mb-2"><Sparkles size={14}/> لوحة التحكم</div>
          <h1 className="text-2xl md:text-4xl font-black text-[#0a0a0a]">
            أهلاً، <span className="gold-text">{(session.user as any).name || "المدير"}</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">الإيرادات: <span className="font-black gold-text">{revenue.toLocaleString()} ج.م</span></p>
        </div>
        {!isManager && (
          <Link href="/admin/artists/new" className="btn-gold text-sm py-2.5 px-4"><Sparkles size={16}/> إضافة فنان</Link>
        )}
      </div>

      {/* Stats — 2 أعمدة جوال، 4 ديسكتوب */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s, i) => (
          <div key={i} className={"rounded-2xl p-4 md:p-5 bg-gradient-to-br " + s.gradient + " shadow-lg"}>
            <div className="flex items-center justify-between mb-2">
              <span className={"text-xs font-bold opacity-80 " + s.text}>{s.label}</span>
              <s.icon size={18} className={s.text + " opacity-80"}/>
            </div>
            <p className={"text-2xl md:text-3xl font-black " + s.text}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* روابط سريعة + آخر الحجوزات */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* روابط سريعة */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-4 md:p-5 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-black text-[#0a0a0a] mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-[#b8941f]"/> روابط سريعة</h2>
          <div className="space-y-1">
            {quickLinks.map((q, i) => (
              <Link key={i} href={q.href} className="flex items-center gap-3 p-2.5 md:p-3 rounded-xl hover:bg-[#faf8f0] transition group">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0"><q.icon size={16} className="text-[#b8941f]"/></div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#0a0a0a] text-sm group-hover:text-[#b8941f] transition">{q.label}</p>
                  <p className="text-[10px] md:text-xs text-gray-500 truncate">{q.desc}</p>
                </div>
                <ArrowLeft size={14} className="text-gray-300 group-hover:text-[#b8941f] transition flex-shrink-0"/>
              </Link>
            ))}
          </div>
        </div>

        {/* آخر الحجوزات */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 md:p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-[#0a0a0a] flex items-center gap-2"><Clock size={18} className="text-[#b8941f]"/> آخر الحجوزات</h2>
            <Link href="/admin/bookings" className="text-xs md:text-sm font-bold text-[#b8941f] hover:text-[#D4AF37] transition">عرض الكل</Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="text-center py-10"><Calendar className="mx-auto text-gray-300 mb-3" size={36}/><p className="text-gray-500 text-sm">لا توجد حجوزات بعد</p></div>
          ) : (
            <div className="space-y-1.5">
              {recentBookings.map((b: any) => {
                const status = gs(b.status)
                const client = b.customer?.fullName || b.clientName || "عميل"
                return (
                  <Link key={b.id} href={"/admin/bookings/" + b.id} className="flex items-center gap-3 p-2.5 md:p-3 rounded-xl hover:bg-[#faf8f0] transition">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#0a0a0a] flex items-center justify-center flex-shrink-0"><Music size={16} className="text-[#D4AF37]"/></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#0a0a0a] text-sm truncate">{b.artist?.name || "فنان"}</p>
                      <p className="text-[10px] md:text-xs text-gray-500 truncate">{client} • {b.date ? new Date(b.date).toLocaleDateString("ar-EG") : "—"}</p>
                    </div>
                    <span className={"text-[10px] px-2 py-0.5 rounded-full font-bold border flex-shrink-0 " + status.c}>{status.l}</span>
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