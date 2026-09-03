import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Music, Calendar, Users, DollarSign, TrendingUp,
  Sparkles, ArrowLeft, Star, CheckCircle2, Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const [artistsCount, bookingsCount, usersCount, totalRevenue, recentBookings] = await Promise.all([
    prisma.artist.count().catch(() => 0),
    prisma.booking.count().catch(() => 0),
    prisma.user.count({ where: { role: "USER" } }).catch(() => 0),
    prisma.booking.aggregate({ _sum: { totalAmount: true }, where: { status: "CONFIRMED" } }).catch(() => ({ _sum: { totalAmount: 0 } })),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { artist: { select: { name: true } }, user: { select: { name: true, email: true } } },
    }).catch(() => []),
  ]);

  const stats = [
    { icon: Music, label: "إجمالي الفنانين", value: artistsCount, accent: "gold" },
    { icon: Calendar, label: "إجمالي الحجوزات", value: bookingsCount, accent: "dark" },
    { icon: Users, label: "المستخدمين", value: usersCount, accent: "gold" },
    { icon: DollarSign, label: "الإيرادات (ج.م)", value: (totalRevenue._sum.totalAmount || 0).toLocaleString(), accent: "dark" },
  ];

  const quickLinks = [
    { icon: Music, label: "الفنانين", href: "/admin/artists", desc: "إدارة ملفات الفنانين" },
    { icon: Calendar, label: "الحجوزات", href: "/admin/bookings", desc: "متابعة كل الحجوزات" },
    { icon: Users, label: "المستخدمين", href: "/admin/users", desc: "حسابات العملاء" },
    { icon: TrendingUp, label: "التقارير", href: "/admin/stats", desc: "الإحصائيات المالية" },
  ];

  return (
    <div dir="rtl" className="space-y-8">
      {/* العنوان */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="badge-gold mb-3">
            <Sparkles size={14} />
            لوحة التحكم
          </div>
          <h1 className="text-4xl font-black text-gray-900">
            أهلاً، <span className="gold-text">{session.user.name || "المدير"}</span>
          </h1>
          <p className="text-gray-500 mt-2">نظرة عامة على أداء منصتك</p>
        </div>
        <Link href="/admin/artists/new" className="btn-gold">
          <Sparkles size={18} />
          إضافة فنان جديد
        </Link>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className={`stat-card ${s.accent === "dark" ? "dark" : ""}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="stat-label">{s.label}</span>
              <s.icon size={20} className={s.accent === "dark" ? "text-[#d4af37]" : "text-[#b8941f]"} />
            </div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* روابط سريعة + آخر الحجوزات */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 card-pro p-6">
          <h2 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
            <TrendingUp size={20} className="text-[#b8941f]" />
            روابط سريعة
          </h2>
          <div className="space-y-2">
            {quickLinks.map((q, i) => (
              <Link
                key={i}
                href={q.href}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#faf8f0] transition group"
              >
                <div className="icon-circle">
                  <q.icon size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 group-hover:text-[#b8941f] transition">{q.label}</p>
                  <p className="text-xs text-gray-500">{q.desc}</p>
                </div>
                <ArrowLeft size={16} className="text-gray-300 group-hover:text-[#b8941f] transition" />
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 card-pro p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Clock size={20} className="text-[#b8941f]" />
              آخر الحجوزات
            </h2>
            <Link href="/admin/bookings" className="text-sm font-bold text-[#b8941f] hover:text-[#d4af37] transition">
              عرض الكل
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-500">لا توجد حجوزات بعد</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentBookings.map((b: any) => (
                <Link
                  key={b.id}
                  href={`/admin/bookings/${b.id}`}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[#faf8f0] transition"
                >
                  <div className="icon-circle dark">
                    <Music size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{b.artist?.name || "فنان"}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {b.user?.name || b.user?.email} • {new Date(b.eventDate).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                  <span className={`status-chip ${
                    b.status === "CONFIRMED" ? "status-confirmed" :
                    b.status === "PENDING" ? "status-pending" :
                    b.status === "COMPLETED" ? "status-completed" : "status-rejected"
                  }`}>
                    {b.status === "CONFIRMED" ? "مؤكد" :
                     b.status === "PENDING" ? "قيد الانتظار" :
                     b.status === "COMPLETED" ? "مكتمل" : "مرفوض"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}