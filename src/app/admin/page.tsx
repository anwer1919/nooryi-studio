import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Music, Calendar, Users, Sparkles, ArrowLeft, Clock, UserPlus, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as any).role || "USER";
  const isManager = role === "ARTIST_MANAGER";

  // ═══ مدير الأعمال → توجيه تلقائي للوحة الاحترافية ═══
  if (isManager) {
    redirect("/admin/manager-dashboard");
  }

  // ═══ Super Admin / Admin → لوحة التحكم الأصلية ═══
  const [artistsCount, bookingsCount, usersCount, customersCount, revenueResult, recentBookings] =
    await Promise.all([
      prisma.artist.count().catch(() => 0),
      prisma.booking.count().catch(() => 0),
      prisma.user.count({ where: { role: "USER" } }).catch(() => 0),
      prisma.customer.count().catch(() => 0),
      prisma.booking
        .aggregate({
          _sum: { grossAmount: true },
          where: { status: { in: ["CONFIRMED", "APPROVED", "ACCEPTED", "COMPLETED"] } },
        })
        .catch(() => ({ _sum: { grossAmount: 0 } })),
      prisma.booking
        .findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            artist: { select: { name: true } },
            customer: { select: { fullName: true } },
            user: { select: { name: true } },
          },
        })
        .catch(() => []),
    ]);

  const stats = [
    { icon: Music, label: "الفنانين", value: artistsCount, accent: "gold" },
    { icon: Calendar, label: "الحجوزات", value: bookingsCount, accent: "dark" },
    { icon: Users, label: "المستخدمين", value: usersCount, accent: "gold" },
    { icon: UserPlus, label: "العملاء", value: customersCount, accent: "dark" },
  ];

  const revenue = revenueResult._sum.grossAmount || 0;

  const quickLinks = [
    { icon: Music, label: "الفنانين", href: "/admin/artists", desc: "إدارة ملفات الفنانين" },
    { icon: Calendar, label: "الحجوزات", href: "/admin/bookings", desc: "متابعة كل الحجوزات" },
    { icon: Users, label: "المستخدمين", href: "/admin/users", desc: "المستخدمون والعملاء" },
    { icon: TrendingUp, label: "التقارير", href: "/admin/stats", desc: "الإحصائيات المالية" },
  ];

  const gs = (s: string) => {
    const u = (s || "").toUpperCase();
    if (["CONFIRMED", "APPROVED", "ACCEPTED"].includes(u)) return { label: "مؤكد", class: "status-confirmed" };
    if (["PENDING_APPROVAL", "PENDING"].includes(u)) return { label: "بانتظار", class: "status-pending" };
    if (["COMPLETED", "DONE"].includes(u)) return { label: "مكتمل", class: "status-completed" };
    return { label: "مرفوض", class: "status-rejected" };
  };

  return (
    <div dir="rtl" className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="badge-gold mb-2">
            <Sparkles size={12} /> لوحة التحكم
          </div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-[var(--c-fg)]">
            أهلاً، <span className="text-[var(--c-orange)]">{(session.user as any).name || "المدير"}</span>
          </h1>
          <p className="text-[var(--c-muted)] mt-1 text-xs md:text-sm">
            الإيرادات:{" "}
            <span className="font-black text-[var(--c-orange)]">{revenue.toLocaleString()} ج.م</span>
          </p>
        </div>
        <Link href="/admin/artists/new" className="btn-primary text-xs md:text-sm py-2 px-3 md:px-4">
          <Sparkles size={14} /> إضافة فنان
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        {stats.map((s, i) => (
          <div key={i} className="dash-card">
            <div className="flex items-center justify-between mb-2">
              <span className="card-subtitle text-[9px] md:text-[10px]">{s.label}</span>
              <s.icon size={14} className="text-[var(--c-orange)]" />
            </div>
            <div className="card-title text-lg md:text-xl lg:text-2xl">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Links + Recent Bookings */}
      <div className="grid lg:grid-cols-3 gap-3 md:gap-4">
        {/* Quick Links */}
        <div className="lg:col-span-1 dash-card p-4 md:p-5">
          <h2 className="card-title text-base md:text-lg mb-3 md:mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-[var(--c-orange)]" /> روابط سريعة
          </h2>
          <div className="space-y-1">
            {quickLinks.map((q, i) => (
              <Link
                key={i}
                href={q.href}
                className="flex items-center gap-2.5 p-2 md:p-2.5 rounded-lg hover:bg-[var(--c-orange-dim)] transition group"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--c-orange-dim)] flex items-center justify-center">
                  <q.icon size={14} className="text-[var(--c-orange)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[var(--c-fg)] text-xs md:text-sm group-hover:text-[var(--c-orange)] transition">
                    {q.label}
                  </p>
                  <p className="text-[9px] md:text-[10px] text-[var(--c-muted)] truncate">{q.desc}</p>
                </div>
                <ArrowLeft
                  size={12}
                  className="text-[var(--c-muted)] group-hover:text-[var(--c-orange)] transition flex-shrink-0"
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="lg:col-span-2 dash-card p-4 md:p-5">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="card-title text-base md:text-lg flex items-center gap-2">
              <Clock size={16} className="text-[var(--c-orange)]" /> آخر الحجوزات
            </h2>
            <Link
              href="/admin/bookings"
              className="text-[10px] md:text-xs font-bold text-[var(--c-orange)] hover:text-[var(--c-fg)] transition"
            >
              عرض الكل
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="text-center py-8 md:py-10">
              <Calendar className="mx-auto text-[var(--c-muted)] mb-2" size={32} />
              <p className="text-[var(--c-muted)] text-xs">لا توجد حجوزات بعد</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentBookings.map((b: any) => {
                const status = gs(b.status);
                const client = b.user?.name || b.customer?.fullName || b.clientName || "عميل";
                return (
                  <Link
                    key={b.id}
                    href={"/admin/bookings/" + b.id}
                    className="flex items-center gap-2.5 md:gap-3 p-2 md:p-2.5 rounded-lg hover:bg-[var(--c-orange-dim)] transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--c-orange-dim)] flex items-center justify-center">
                      <Music size={14} className="text-[var(--c-orange)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[var(--c-fg)] text-xs md:text-sm truncate">
                        {b.artist?.name || "فنان"}
                      </p>
                      <p className="text-[9px] md:text-[10px] text-[var(--c-muted)] truncate">
                        {client} • {b.date ? new Date(b.date).toLocaleDateString("ar-EG") : "—"}
                      </p>
                    </div>
                    <span className={"status-badge text-[9px] " + status.class}>{status.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
