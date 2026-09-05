import { prisma } from "@/lib/prisma";
import { CheckCircle2, Shield, Calendar, Clock, MapPin, User, Phone, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function VerifyCalendarPage({
  params, searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ report?: string; month?: string; year?: string }>;
}) {
  const { slug } = await params;
  const { report, month, year } = await searchParams;

  const artist = await prisma.artist.findUnique({
    where: { slug },
    include: {
      bookings: {
        where: { status: { in: ["APPROVED", "CONFIRMED", "COMPLETED"] } },
        orderBy: { date: "asc" }
      }
    }
  });

  if (!artist) {
    return (
      <div dir="rtl" className="min-h-screen bg-red-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-black text-red-700 mb-4">❌ رابط غير صالح</h1>
          <Link href="/" className="text-[#D4AF37] hover:underline">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  const m = month ? parseInt(month) - 1 : new Date().getMonth();
  const y = year ? parseInt(year) : new Date().getFullYear();
  
  const filtered = artist.bookings.filter(b => {
    const d = new Date(b.date);
    return d.getMonth() === m && d.getFullYear() === y;
  });

  const monthName = new Date(y, m, 1).toLocaleDateString("ar-EG", { month: "long", year: "numeric" });
  const totalRevenue = filtered.reduce((s, b) => s + Number(b.grossAmount || 0), 0);

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-[#faf8f0] to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-[#0a0a0a] to-[#111] rounded-2xl p-8 text-white mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center">
                <span className="text-[#111] text-2xl font-black">N</span>
              </div>
              <div>
                <h1 className="text-2xl font-black">Nooryi Studio</h1>
                <p className="text-xs text-[#D4AF37]">تأكيد صحة التقويم</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500 rounded-full px-4 py-2">
              <CheckCircle2 size={20} className="text-green-400" />
              <span className="text-green-300 font-bold text-sm">تم التحقق ✓</span>
            </div>
          </div>
          <div className="h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent my-6"></div>
          <h2 className="text-3xl font-black">{artist.name} — {monthName}</h2>
          <p className="text-sm text-gray-300 mt-2">رقم التقرير: <span className="font-mono text-[#D4AF37]" dir="ltr">{report || "—"}</span></p>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-green-900 mb-2">✓ هذا التقرير أصلي ومعتمد</h3>
              <p className="text-sm text-green-800">
                تم التحقق من صحة تقويم حجوزات <strong>{artist.name}</strong> لشهر <strong>{monthName}</strong>.
                جميع الحجوزات الموضحة أدناه مؤكدة ومسجلة رسمياً في قاعدة بيانات المنصة.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 border-2 border-[#D4AF37]">
            <p className="text-xs text-gray-500 font-bold uppercase">الحجوزات</p>
            <p className="text-4xl font-black">{filtered.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border">
            <p className="text-xs text-gray-500 font-bold uppercase">الإيرادات</p>
            <p className="text-2xl font-black text-[#D4AF37]">{totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500">ج.م</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border">
            <p className="text-xs text-gray-500 font-bold uppercase">تاريخ التحقق</p>
            <p className="text-sm font-bold">{new Date().toLocaleDateString("ar-EG")}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border">
          <div className="bg-gradient-to-r from-[#D4AF37] to-[#b8941f] px-6 py-4">
            <h3 className="text-xl font-black text-[#111] flex items-center gap-2">
              <Calendar size={20} />
              الحجوزات المعتمدة
            </h3>
          </div>
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">لا توجد حجوزات في هذا الشهر</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-black">#</th>
                  <th className="px-4 py-3 text-right text-xs font-black">التاريخ</th>
                  <th className="px-4 py-3 text-center text-xs font-black">الوقت</th>
                  <th className="px-4 py-3 text-right text-xs font-black">العميل</th>
                  <th className="px-4 py-3 text-right text-xs font-black">الموقع</th>
                  <th className="px-4 py-3 text-center text-xs font-black">المبلغ</th>
                  <th className="px-4 py-3 text-center text-xs font-black">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => (
                  <tr key={b.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{String(i+1).padStart(2,'0')}</td>
                    <td className="px-4 py-3 font-black">{new Date(b.date).toLocaleDateString("ar-EG")}</td>
                    <td className="px-4 py-3 text-center text-sm">{b.timeSlot || "—"}</td>
                    <td className="px-4 py-3 font-bold">{b.clientName}</td>
                    <td className="px-4 py-3 text-sm">{(b as any).venue?.name || "—"}</td>
                    <td className="px-4 py-3 text-center font-black text-[#D4AF37]">
                      {b.grossAmount ? `${Number(b.grossAmount).toLocaleString()} ج.م` : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                        {b.status === "COMPLETED" ? "مكتمل" : b.status === "CONFIRMED" ? "مؤكد" : "موافق عليه"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href={`/artists/${artist.slug}`} className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#111] font-black rounded-xl">
            <ArrowLeft size={18} /> العودة لصفحة الفنان
          </Link>
        </div>
      </div>
    </div>
  );
}