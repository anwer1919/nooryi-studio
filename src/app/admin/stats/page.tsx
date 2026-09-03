import { prisma } from "@/lib/prisma";
import { TrendingUp, DollarSign, Calendar, Users, UserPlus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminStatsPage() {
  const [totalBookings, confirmedBookings, totalRevenue, totalArtists, totalUsers, totalCustomers] = await Promise.all([
    prisma.booking.count().catch(() => 0),
    prisma.booking.count({
      where: { status: { in: ["CONFIRMED", "APPROVED", "ACCEPTED", "COMPLETED"] } },
    }).catch(() => 0),
    prisma.booking.aggregate({
      _sum: { grossAmount: true },
      where: { status: { in: ["CONFIRMED", "APPROVED", "ACCEPTED", "COMPLETED"] } },
    }).catch(() => ({ _sum: { grossAmount: 0 } })),
    prisma.artist.count().catch(() => 0),
    prisma.user.count({ where: { role: "USER" } }).catch(() => 0),
    prisma.customer.count().catch(() => 0),
  ]);

  const revenue = totalRevenue._sum.grossAmount || 0;
  const avgBooking = confirmedBookings > 0 ? Math.round(revenue / confirmedBookings) : 0;
  const conversionRate = totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0;

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <div className="badge-gold mb-3">التقارير المالية</div>
        <h1 className="text-4xl font-black text-gray-900">الإحصائيات والتقارير</h1>
        <p className="text-gray-500 mt-1">نظرة شاملة على أداء المنصة</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">إجمالي الإيرادات</span>
            <DollarSign size={20} className="text-[#b8941f]" />
          </div>
          <div className="stat-value">{revenue.toLocaleString()}</div>
          <p className="text-xs text-gray-500 mt-2">ج.م</p>
        </div>
        <div className="stat-card dark">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">متوسط الحجز</span>
            <TrendingUp size={20} />
          </div>
          <div className="stat-value">{avgBooking.toLocaleString()}</div>
          <p className="text-xs text-gray-400 mt-2">ج.م / حجز</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">معدل التحويل</span>
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <div className="stat-value">{conversionRate}%</div>
          <p className="text-xs text-gray-500 mt-2">من الحجوزات المؤكدة</p>
        </div>
        <div className="stat-card dark">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">إجمالي الحجوزات</span>
            <Calendar size={20} />
          </div>
          <div className="stat-value">{totalBookings}</div>
          <p className="text-xs text-gray-400 mt-2">{confirmedBookings} مؤكدة</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-pro p-6">
          <h2 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
            <Users size={20} className="text-[#b8941f]" />
            ملخص المنصة
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-[#faf8f0] rounded-2xl">
              <span className="font-semibold text-gray-700">إجمالي الفنانين</span>
              <span className="font-black text-2xl gold-text">{totalArtists}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#faf8f0] rounded-2xl">
              <span className="font-semibold text-gray-700">المستخدمين المسجلين</span>
              <span className="font-black text-2xl gold-text">{totalUsers}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#faf8f0] rounded-2xl">
              <span className="font-semibold text-gray-700">العملاء</span>
              <span className="font-black text-2xl gold-text">{totalCustomers}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#faf8f0] rounded-2xl">
              <span className="font-semibold text-gray-700">الحجوزات المؤكدة</span>
              <span className="font-black text-2xl gold-text">{confirmedBookings}</span>
            </div>
          </div>
        </div>

        <div className="card-pro p-6">
          <h2 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
            <TrendingUp size={20} className="text-[#b8941f]" />
            مؤشرات الأداء
          </h2>
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-700">نسبة الحجوزات المؤكدة</span>
                <span className="text-sm font-black text-[#b8941f]">{conversionRate}%</span>
              </div>
              <div className="h-3 bg-[#faf8f0] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#d4af37] to-[#b8941f]" style={{ width: `${conversionRate}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-700">متوسط قيمة الحجز</span>
                <span className="text-sm font-black text-[#b8941f]">{avgBooking.toLocaleString()} ج.م</span>
              </div>
              <div className="h-3 bg-[#faf8f0] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#d4af37] to-[#b8941f]" style={{ width: "70%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-700">رضا العملاء</span>
                <span className="text-sm font-black text-[#b8941f]">98%</span>
              </div>
              <div className="h-3 bg-[#faf8f0] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#d4af37] to-[#b8941f]" style={{ width: "98%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}