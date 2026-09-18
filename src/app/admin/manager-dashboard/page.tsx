import { getManagerArtistDirect } from "@/lib/managerAuth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  Calendar, DollarSign, Users, TrendingUp, Clock, 
  CheckCircle2, Music, ArrowLeft, FileText, Star 
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ManagerDashboard() {
  const { artist } = await getManagerArtistDirect();

  // جلب البيانات المجمعة
  const [bookings, reviews] = await Promise.all([
    prisma.booking.findMany({
      where: { artistId: artist.id },
      orderBy: { date: "desc" },
      include: { venue: { select: { name: true } } },
    }),
    prisma.review.findMany({
      where: { artistId: artist.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  // حساب الإحصائيات
  const stats = {
    totalBookings: bookings.length,
    pending: bookings.filter(b => ["PENDING", "PENDING_APPROVAL"].includes(b.status)).length,
    confirmed: bookings.filter(b => ["CONFIRMED", "APPROVED", "COMPLETED"].includes(b.status)).length,
    revenue: bookings
      .filter(b => ["CONFIRMED", "APPROVED", "COMPLETED"].includes(b.status))
      .reduce((sum, b) => sum + Number(b.grossAmount || 0), 0),
    avgRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
      : "—",
  };

  // الحجوزات القادمة (المؤكدة فقط)
  const upcomingBookings = bookings
    .filter(b => ["CONFIRMED", "APPROVED"].includes(b.status) && new Date(b.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // الإجراءات المطلوبة (قيد الانتظار)
  const actionRequired = bookings
    .filter(b => ["PENDING", "PENDING_APPROVAL"].includes(b.status))
    .slice(0, 3);

  return (
    <div dir="rtl" className="space-y-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="badge-gold mb-2">لوحة التحكم</div>
          <h1 className="text-display">{artist.name}</h1>
          <p className="text-[var(--c-muted)] mt-1">مرحباً بك في مساحة إدارة أعمالك</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/admin/artist/${artist.slug}/bookings`} className="btn-outline text-sm">
            كل الحجوزات
          </Link>
          <Link href={`/admin/artist/${artist.slug}/pricing`} className="btn-primary text-sm">
            إدارة التسعير
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dash-card group hover:border-[var(--c-orange)] transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="card-subtitle text-xs">الإيرادات</span>
            <div className="w-8 h-8 rounded-lg bg-[var(--c-orange-dim)] flex items-center justify-center">
              <DollarSign size={16} className="text-[var(--c-orange)]" />
            </div>
          </div>
          <p className="card-title text-2xl">{stats.revenue.toLocaleString()}</p>
          <p className="text-xs text-[var(--c-muted)] mt-1">جنيه مصري</p>
        </div>

        <div className="dash-card group hover:border-[var(--c-orange)] transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="card-subtitle text-xs">حجوزات مؤكدة</span>
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-green-500" />
            </div>
          </div>
          <p className="card-title text-2xl">{stats.confirmed}</p>
          <p className="text-xs text-[var(--c-muted)] mt-1">من أصل {stats.totalBookings}</p>
        </div>

        <div className="dash-card group hover:border-[var(--c-orange)] transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="card-subtitle text-xs">تحتاج إجراء</span>
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Clock size={16} className="text-yellow-500" />
            </div>
          </div>
          <p className="card-title text-2xl">{stats.pending}</p>
          <p className="text-xs text-[var(--c-muted)] mt-1">طلبات قيد المراجعة</p>
        </div>

        <div className="dash-card group hover:border-[var(--c-orange)] transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="card-subtitle text-xs">التقييم العام</span>
            <div className="w-8 h-8 rounded-lg bg-[var(--c-orange-dim)] flex items-center justify-center">
              <Star size={16} className="text-[var(--c-orange)]" />
            </div>
          </div>
          <p className="card-title text-2xl">{stats.avgRating}</p>
          <p className="text-xs text-[var(--c-muted)] mt-1">من 5 نجوم</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Upcoming + Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Action Required Section */}
          {actionRequired.length > 0 && (
            <div className="dash-card border-yellow-500/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="card-title flex items-center gap-2">
                  <Clock size={18} className="text-yellow-500" />
                  تحتاج إجراء فوري
                </h3>
                <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full">
                  {actionRequired.length} طلبات
                </span>
              </div>
              <div className="space-y-3">
                {actionRequired.map(b => (
                  <Link 
                    key={b.id} 
                    href={`/admin/bookings/${b.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--c-bg)] border border-[var(--c-border)] hover:border-[var(--c-orange)] transition group"
                  >
                    <div>
                      <p className="font-bold text-[var(--c-fg)]">{b.clientName}</p>
                      <p className="text-xs text-[var(--c-muted)]">
                        {new Date(b.date).toLocaleDateString("ar-EG")} • {b.venue?.name || "غير محدد"}
                      </p>
                    </div>
                    <span className="status-badge pending text-[10px]">مراجعة</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Bookings */}
          <div className="dash-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title flex items-center gap-2">
                <Calendar size={18} className="text-[var(--c-orange)]" />
                الحجوزات القادمة
              </h3>
              <Link href={`/admin/artist/${artist.slug}/bookings`} className="text-xs text-[var(--c-orange)] hover:underline">
                عرض الكل ←
              </Link>
            </div>
            
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8 text-[var(--c-muted)] text-sm">
                لا توجد حجوزات قادمة حالياً
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map(b => (
                  <Link 
                    key={b.id} 
                    href={`/admin/bookings/${b.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-[var(--c-bg)] border border-[var(--c-border)] hover:border-[var(--c-orange)] transition"
                  >
                    <div className="w-14 h-14 rounded-lg bg-[var(--c-orange-dim)] flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-[var(--c-orange)]">
                        {new Date(b.date).toLocaleDateString("ar-EG", { month: "short" })}
                      </span>
                      <span className="text-lg font-black text-[var(--c-orange)]">
                        {new Date(b.date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[var(--c-fg)] truncate">{b.clientName}</p>
                      <p className="text-xs text-[var(--c-muted)] truncate">
                        {b.timeSlot || "—"} • {b.venue?.name || "غير محدد"}
                      </p>
                    </div>
                    <div className="text-left flex-shrink-0">
                      <p className="font-bold text-[var(--c-orange)] text-sm">
                        {Number(b.grossAmount || 0).toLocaleString()} ج.م
                      </p>
                      <span className="status-badge confirmed text-[10px]">مؤكد</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Links + Profile Summary */}
        <div className="space-y-6">
          
          {/* Artist Mini Profile */}
          <div className="dash-card text-center">
            <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden border-2 border-[var(--c-orange)]">
              {artist.profileImage ? (
                <img src={artist.profileImage} alt={artist.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[var(--c-orange)] flex items-center justify-center text-black font-black text-2xl">
                  {artist.name.charAt(0)}
                </div>
              )}
            </div>
            <h3 className="card-title text-lg">{artist.name}</h3>
            <p className="text-[var(--c-orange)] text-sm font-bold mb-4">{artist.category}</p>
            
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-lg bg-[var(--c-bg)] border border-[var(--c-border)]">
                <p className="text-lg font-bold text-[var(--c-fg)]">{stats.totalBookings}</p>
                <p className="text-[10px] text-[var(--c-muted)]">حجز</p>
              </div>
              <div className="p-2 rounded-lg bg-[var(--c-bg)] border border-[var(--c-border)]">
                <p className="text-lg font-bold text-[var(--c-fg)]">{stats.avgRating}</p>
                <p className="text-[10px] text-[var(--c-muted)]">تقييم</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dash-card">
            <h3 className="card-title mb-4 text-sm">وصول سريع</h3>
            <div className="space-y-2">
              <Link href={`/admin/artist/${artist.slug}/bookings`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--c-orange-dim)] transition group">
                <div className="w-8 h-8 rounded-lg bg-[var(--c-bg)] border border-[var(--c-border)] flex items-center justify-center group-hover:border-[var(--c-orange)]">
                  <Calendar size={16} className="text-[var(--c-orange)]" />
                </div>
                <span className="text-sm font-medium text-[var(--c-fg)]">إدارة الحجوزات</span>
              </Link>
              <Link href={`/admin/artist/${artist.slug}/pricing`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--c-orange-dim)] transition group">
                <div className="w-8 h-8 rounded-lg bg-[var(--c-bg)] border border-[var(--c-border)] flex items-center justify-center group-hover:border-[var(--c-orange)]">
                  <DollarSign size={16} className="text-[var(--c-orange)]" />
                </div>
                <span className="text-sm font-medium text-[var(--c-fg)]">الأسعار والباقات</span>
              </Link>
              <Link href="/admin/reports" className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--c-orange-dim)] transition group">
                <div className="w-8 h-8 rounded-lg bg-[var(--c-bg)] border border-[var(--c-border)] flex items-center justify-center group-hover:border-[var(--c-orange)]">
                  <FileText size={16} className="text-[var(--c-orange)]" />
                </div>
                <span className="text-sm font-medium text-[var(--c-fg)]">التقارير المالية</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
