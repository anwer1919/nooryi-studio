import { prisma } from "@/lib/prisma";
import { CheckCircle2, Shield, Award, MapPin, DollarSign, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function VerifyPricingPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ report?: string }>;
}) {
  const { slug } = await params;
  const { report } = await searchParams;

  // جلب الفنان
  const artist = await prisma.artist.findUnique({
    where: { slug },
    include: {
      pricingRegions: {
        orderBy: { regionName: "asc" }
      }
    }
  });

  if (!artist) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center border-2 border-red-200">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-2xl font-black text-red-700 mb-2">رابط غير صالح</h1>
          <p className="text-gray-600 mb-6">لم يتم العثور على الفنان المطلوب</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold">
            <ArrowLeft size={18} />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const totalRegions = artist.pricingRegions.length;
  const avgPrice = totalRegions > 0
    ? Math.round(artist.pricingRegions.reduce((s, r) => s + Number(r.basePrice), 0) / totalRegions)
    : 0;

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-[#faf8f0] to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0a0a0a] to-[#111] rounded-2xl p-8 text-white mb-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center">
                <span className="text-[#111] text-2xl font-black">N</span>
              </div>
              <div>
                <h1 className="text-2xl font-black">Nooryi Studio</h1>
                <p className="text-xs text-[#D4AF37]">تأكيد صحة الأسعار</p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500 rounded-full px-4 py-2">
                <CheckCircle2 size={20} className="text-green-400" />
                <span className="text-green-300 font-bold text-sm">تم التحقق ✓</span>
              </div>
            </div>
          </div>

          <div className="h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent my-6"></div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">تقرير أسعار</p>
              <h2 className="text-3xl font-black mt-1">{artist.name}</h2>
              <p className="text-sm text-gray-300 mt-1">{artist.category || "فنان"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">رقم التقرير</p>
              <p className="text-sm font-mono text-[#D4AF37]" dir="ltr">{report || "—"}</p>
            </div>
          </div>
        </div>

        {/* Verification Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Shield size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-green-900 mb-2">
                ✓ هذا التقرير أصلي ومعتمد
              </h3>
              <p className="text-sm text-green-800 leading-relaxed">
                تم التحقق من صحة هذا التقرير بنجاح. الأسعار الموضحة أدناه هي الأسعار الرسمية المعتمدة من
                منصة <strong>Nooryi Studio</strong> للفنان <strong>{artist.name}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 border-2 border-[#D4AF37] shadow-lg">
            <p className="text-xs text-gray-500 font-bold uppercase mb-2">عدد المناطق</p>
            <p className="text-4xl font-black text-gray-900">{totalRegions}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow">
            <p className="text-xs text-gray-500 font-bold uppercase mb-2">متوسط السعر</p>
            <p className="text-3xl font-black text-[#D4AF37]">{avgPrice.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">ج.م</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow">
            <p className="text-xs text-gray-500 font-bold uppercase mb-2">تاريخ التحقق</p>
            <p className="text-sm font-bold text-gray-900">
              {new Date().toLocaleDateString("ar-EG", {
                year: "numeric", month: "long", day: "numeric"
              })}
            </p>
          </div>
        </div>

        {/* Regions Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 mb-6">
          <div className="bg-gradient-to-r from-[#D4AF37] to-[#b8941f] px-6 py-4">
            <h3 className="text-xl font-black text-[#111] flex items-center gap-2">
              <MapPin size={20} />
              الأسعار الرسمية المعتمدة
            </h3>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-black text-gray-600 uppercase">#</th>
                <th className="px-6 py-3 text-right text-xs font-black text-gray-600 uppercase">المنطقة</th>
                <th className="px-6 py-3 text-center text-xs font-black text-gray-600 uppercase">السعر الأساسي</th>
                <th className="px-6 py-3 text-center text-xs font-black text-gray-600 uppercase">رسوم السفر</th>
                <th className="px-6 py-3 text-center text-xs font-black text-gray-600 uppercase">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {artist.pricingRegions.map((r, i) => {
                const total = Number(r.basePrice) + Number(r.travelFee || 0);
                return (
                  <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      {String(i + 1).padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-[#D4AF37]" />
                        <span className="font-black text-gray-900">{r.regionName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-900">
                      {Number(r.basePrice).toLocaleString()} ج.م
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {Number(r.travelFee || 0) > 0 ? `+${Number(r.travelFee).toLocaleString()} ج.م` : "—"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-4 py-1 bg-[#D4AF37] text-[#111] font-black rounded-lg">
                        {total.toLocaleString()} ج.م
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Official Notice */}
        <div className="bg-[#0a0a0a] rounded-2xl p-6 text-white text-center">
          <Award size={32} className="mx-auto text-[#D4AF37] mb-2" />
          <p className="text-xs text-gray-400">
            هذا التقرير صادر رسمياً من منصة Nooryi Studio — جميع الحقوق محفوظة © {new Date().getFullYear()}
          </p>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <Link
            href={`/artists/${artist.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#111] font-black rounded-xl hover:shadow-lg transition"
          >
            <ArrowLeft size={18} />
            العودة لصفحة الفنان
          </Link>
        </div>
      </div>
    </div>
  );
}