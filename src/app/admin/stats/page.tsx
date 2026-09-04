import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { TrendingUp, DollarSign, Calendar, Users, Printer, Eye, Award, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminStatsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = (session.user as any).role || "USER";
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") redirect("/");

  // جلب جميع الفنانين مع حجوزاتهم
  const artists = await prisma.artist.findMany({
    where: { status: "ACTIVE" },
    include: {
      bookings: {
        where: { status: { in: ["APPROVED", "CONFIRMED", "COMPLETED", "ACCEPTED"] } },
        select: {
          id: true,
          grossAmount: true,
          status: true,
          date: true,
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // حساب الإحصائيات العامة
  const totalBookings = artists.reduce((sum, a) => sum + a.bookings.length, 0);
  const totalRevenue = artists.reduce((sum, a) => 
    sum + a.bookings.reduce((bs, b) => bs + Number(b.grossAmount || 0), 0), 0
  );
  const totalCommission = artists.reduce((sum, a) => 
    sum + a.bookings.reduce((bs, b) => 
      bs + (Number(b.grossAmount || 0) * ((a as any).commissionRate || 20) / 100), 0
    ), 0
  );
  const totalArtistEarnings = totalRevenue - totalCommission;

  return (
    <div dir="rtl" className="p-6 space-y-6 max-w-7xl mx-auto">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { margin: 1cm; size: A4; }
        }
      `}</style>

      <div className="no-print">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white">التقارير المالية</h1>
        <p className="text-gray-500 mt-1">اختر فناناً لطباعة تقريره المالي الكامل</p>
      </div>

      {/* Cards عامة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
        <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Calendar size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">إجمالي الحجوزات</p>
              <p className="text-2xl font-black">{totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <DollarSign size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">إجمالي الإيرادات</p>
              <p className="text-2xl font-black">{totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-400">ج.م</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
              <TrendingUp size={24} className="text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">عمولة المنصة</p>
              <p className="text-2xl font-black text-[#D4AF37]">{totalCommission.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
              <p className="text-xs text-gray-400">ج.م</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Users size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">أرباح الفنانين</p>
              <p className="text-2xl font-black">{totalArtistEarnings.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
              <p className="text-xs text-gray-400">ج.م</p>
            </div>
          </div>
        </div>
      </div>

      {/* قائمة الفنانين مع زر طباعة لكل واحد */}
      <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Award size={24} className="text-[#D4AF37]" />
            اختر فناناً لطباعة تقريره المالي
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            اضغط على "طباعة التقرير" لفتح تقرير A4 كامل قابل للطباعة
          </p>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {artists.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FileText size={48} className="mx-auto mb-3 opacity-30" />
              <p>لا يوجد فنانين نشطين</p>
            </div>
          ) : (
            artists.map((artist) => {
              const revenue = artist.bookings.reduce((sum, b) => sum + Number(b.grossAmount || 0), 0);
              const commissionRate = (artist as any).commissionRate || 20;
              const commission = revenue * commissionRate / 100;
              const artistNet = revenue - commission;

              return (
                <div key={artist.id} className="p-5 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      {artist.profileImage ? (
                        <img src={artist.profileImage} alt={artist.name} className="w-14 h-14 rounded-full object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center text-[#111] font-black text-xl">
                          {artist.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-black text-lg text-gray-900 dark:text-white">{artist.name}</p>
                        <p className="text-xs text-gray-500">{(artist as any).category || "فنان"} — {artist.bookings.length} حجز</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-gray-500">الإيرادات</p>
                        <p className="font-black text-gray-900 dark:text-white">{revenue.toLocaleString()} ج.م</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">نسبة العمولة</p>
                        <p className="font-bold text-yellow-600">{commissionRate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">عمولة المنصة</p>
                        <p className="font-black text-[#D4AF37]">{commission.toLocaleString(undefined, {maximumFractionDigits: 0})} ج.م</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">صافي الفنان</p>
                        <p className="font-black text-green-600">{artistNet.toLocaleString(undefined, {maximumFractionDigits: 0})} ج.م</p>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/admin/stats/${artist.id}`}
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition flex items-center gap-2"
                        >
                          <Eye size={16} />
                          عرض
                        </Link>
                        <Link
                          href={`/admin/stats/${artist.id}?print=true`}
                          target="_blank"
                          className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-bold rounded-lg hover:shadow-lg transition flex items-center gap-2"
                        >
                          <Printer size={16} />
                          طباعة التقرير
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {artists.length > 0 && (
          <div className="bg-gray-50 dark:bg-[#1a1a1a] p-5 border-t-2 border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-4 gap-4 text-center font-black">
              <div>
                <p className="text-xs text-gray-500 mb-1">الإجمالي</p>
                <p>{totalBookings} حجز</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">الإيرادات</p>
                <p>{totalRevenue.toLocaleString()} ج.م</p>
              </div>
              <div className="text-[#D4AF37]">
                <p className="text-xs text-gray-500 mb-1">عمولة المنصة</p>
                <p>{totalCommission.toLocaleString(undefined, {maximumFractionDigits: 0})} ج.م</p>
              </div>
              <div className="text-green-600">
                <p className="text-xs text-gray-500 mb-1">صافي الفنانين</p>
                <p>{totalArtistEarnings.toLocaleString(undefined, {maximumFractionDigits: 0})} ج.م</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}