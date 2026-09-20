import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PrintLayout from "@/components/PrintLayout";
import { Calendar, DollarSign, Users, TrendingUp, CheckCircle2, Clock, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = session.user as any;
  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const isAdmin = user.role === "ADMIN";
  const isManager = user.role === "ARTIST_MANAGER";

  // تحديد نطاق البيانات حسب الدور
  let artistFilter: any = {};
  if (isManager && user.artistId) {
    artistFilter = { artistId: user.artistId };
  }

  // جلب البيانات
  const [bookings, artists, reviews] = await Promise.all([
    prisma.booking.findMany({
      where: artistFilter,
      include: { artist: { select: { name: true, category: true } }, venue: { select: { name: true } } },
      orderBy: { date: "desc" }
    }),
    isSuperAdmin || isAdmin ? prisma.artist.findMany({ select: { id: true, name: true, category: true } }) : [],
    prisma.review.findMany({ where: artistFilter, orderBy: { createdAt: "desc" }, take: 10 })
  ]);

  // حساب الإحصائيات
  const totalRevenue = bookings.reduce((s, b) => s + Number(b.grossAmount || 0), 0);
  const totalDeposits = bookings.reduce((s, b) => s + Number(b.depositAmount || 0), 0);
  const totalRemaining = bookings.reduce((s, b) => s + Number(b.remainingAmount || 0), 0);
  const confirmed = bookings.filter(b => ["CONFIRMED", "COMPLETED", "APPROVED"].includes(b.status));
  const pending = bookings.filter(b => ["PENDING", "PENDING_APPROVAL"].includes(b.status));
  const cancelled = bookings.filter(b => ["CANCELLED", "REJECTED"].includes(b.status));
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  // إيرادات كل فنان
  const revenueByArtist: Record<string, { name: string; revenue: number; count: number }> = {};
  bookings.forEach(b => {
    const aid = b.artistId;
    if (!revenueByArtist[aid]) revenueByArtist[aid] = { name: b.artist?.name || "غير معروف", revenue: 0, count: 0 };
    revenueByArtist[aid].revenue += Number(b.grossAmount || 0);
    revenueByArtist[aid].count++;
  });
  const topArtists = Object.values(revenueByArtist).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  return (
    <div dir="rtl" className="space-y-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="badge-gold mb-2">التقارير المالية</div>
          <h1 className="text-display">لوحة التقارير</h1>
          <p className="text-[var(--c-muted)] mt-1">نظرة شاملة على الأداء المالي والحجوزات</p>
        </div>
        <button onClick={() => window.print()} className="btn-primary text-sm flex items-center gap-2"><TrendingUp size={16} /> طباعة التقرير</button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dash-card"><div className="flex items-center justify-between mb-3"><span className="card-subtitle text-xs">إجمالي الإيرادات</span><div className="w-8 h-8 rounded-lg bg-[var(--c-orange-dim)] flex items-center justify-center"><DollarSign size={16} className="text-[var(--c-orange)]" /></div></div><p className="card-title text-2xl">{totalRevenue.toLocaleString()}</p><p className="text-xs text-[var(--c-muted)] mt-1">جنيه مصري</p></div>
        <div className="dash-card"><div className="flex items-center justify-between mb-3"><span className="card-subtitle text-xs">العربونات المحصلة</span><div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center"><CheckCircle2 size={16} className="text-green-500" /></div></div><p className="card-title text-2xl">{totalDeposits.toLocaleString()}</p><p className="text-xs text-[var(--c-muted)] mt-1">جنيه مصري</p></div>
        <div className="dash-card"><div className="flex items-center justify-between mb-3"><span className="card-subtitle text-xs">المبالغ المتبقية</span><div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center"><Clock size={16} className="text-red-500" /></div></div><p className="card-title text-2xl">{totalRemaining.toLocaleString()}</p><p className="text-xs text-[var(--c-muted)] mt-1">جنيه مصري</p></div>
        <div className="dash-card"><div className="flex items-center justify-between mb-3"><span className="card-subtitle text-xs">متوسط التقييم</span><div className="w-8 h-8 rounded-lg bg-[var(--c-orange-dim)] flex items-center justify-center"><Users size={16} className="text-[var(--c-orange)]" /></div></div><p className="card-title text-2xl">{avgRating}</p><p className="text-xs text-[var(--c-muted)] mt-1">من 5 نجوم</p></div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue by Artist */}
        <div className="lg:col-span-2 dash-card">
          <h3 className="card-title flex items-center gap-2 mb-4"><TrendingUp size={18} className="text-[var(--c-orange)]" /> إيرادات الفنانين</h3>
          {topArtists.length === 0 ? (<p className="text-[var(--c-muted)] text-sm text-center py-4">لا توجد بيانات</p>) : (
            <div className="space-y-3">{topArtists.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[var(--c-bg)] border border-[var(--c-border)]">
                <div><p className="font-bold text-[var(--c-fg)]">{a.name}</p><p className="text-xs text-[var(--c-muted)]">{a.count} حجز</p></div>
                <p className="font-bold text-[var(--c-orange)] text-lg">{a.revenue.toLocaleString()} ج.م</p>
              </div>
            ))}</div>
          )}
        </div>

        {/* Booking Status Summary */}
        <div className="space-y-6">
          <div className="dash-card">
            <h3 className="card-title flex items-center gap-2 mb-4"><Calendar size={18} className="text-[var(--c-orange)]" /> ملخص الحجوزات</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/20"><span className="text-sm font-medium text-green-600">مؤكدة / مكتملة</span><span className="font-bold text-green-600 text-lg">{confirmed.length}</span></div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20"><span className="text-sm font-medium text-yellow-600">قيد الانتظار</span><span className="font-bold text-yellow-600 text-lg">{pending.length}</span></div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20"><span className="text-sm font-medium text-red-600">ملغية / مرفوضة</span><span className="font-bold text-red-600 text-lg">{cancelled.length}</span></div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--c-bg)] border border-[var(--c-border)]"><span className="text-sm font-medium text-[var(--c-fg)]">الإجمالي</span><span className="font-bold text-[var(--c-fg)] text-lg">{bookings.length}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="dash-card">
        <h3 className="card-title flex items-center gap-2 mb-4"><DollarSign size={18} className="text-[var(--c-orange)]" /> آخر الحجوزات</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[var(--c-border)]"><th className="text-right py-3 px-2 font-bold text-[var(--c-muted)]">العميل</th><th className="text-right py-3 px-2 font-bold text-[var(--c-muted)]">الفنان</th><th className="text-right py-3 px-2 font-bold text-[var(--c-muted)]">التاريخ</th><th className="text-right py-3 px-2 font-bold text-[var(--c-muted)]">المبلغ</th><th className="text-right py-3 px-2 font-bold text-[var(--c-muted)]">الحالة</th></tr></thead>
            <tbody>{bookings.slice(0, 15).map(b => {
              const sm: Record<string,string> = { PENDING_APPROVAL:"معلق", PENDING:"معلق", CONFIRMED:"مؤكد", APPROVED:"مؤكد", COMPLETED:"مكتمل", CANCELLED:"ملغي", REJECTED:"مرفوض" };
              const sc: Record<string,string> = { PENDING_APPROVAL:"pending", PENDING:"pending", CONFIRMED:"confirmed", APPROVED:"confirmed", COMPLETED:"confirmed", CANCELLED:"cancelled", REJECTED:"cancelled" };
              return (<tr key={b.id} className="border-b border-[var(--c-border)]/50 hover:bg-[var(--c-orange-dim)]/30 transition">
                <td className="py-3 px-2 font-medium text-[var(--c-fg)]">{b.clientName}</td>
                <td className="py-3 px-2 text-[var(--c-muted)]">{b.artist?.name || "—"}</td>
                <td className="py-3 px-2 text-[var(--c-muted)]">{new Date(b.date).toLocaleDateString("ar-EG")}</td>
                <td className="py-3 px-2 font-bold text-[var(--c-orange)]">{Number(b.grossAmount||0).toLocaleString()}</td>
                <td className="py-3 px-2"><span className={`status-badge ${sc[b.status]||""}`}>{sm[b.status]||b.status}</span></td>
              </tr>);
            })}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
