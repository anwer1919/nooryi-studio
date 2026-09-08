import { getManagerArtist } from "@/lib/managerAuth"
import { prisma } from "@/lib/prisma"
import { Banknote, Printer, Plus } from "lucide-react"
import PricingForm from "./PricingForm"

export const dynamic = "force-dynamic"

export default async function ArtistPricing({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { artist } = await getManagerArtist(slug)

  const [pricings, regions] = await Promise.all([
    prisma.pricing.findMany({ where: { artistId: artist.id }, orderBy: { price: "asc" } }),
    prisma.pricingRegion.findMany({ where: { artistId: artist.id }, orderBy: { basePrice: "asc" } }).catch(() => []),
  ])

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 no-print">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Banknote size={28} className="text-[#D4AF37]" /> تسعير {artist.name}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{pricings.length} باقة • {regions.length} منطقة</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-[#D4AF37] rounded-xl font-bold text-sm hover:bg-[#222] transition border border-[#D4AF37]/20">
          <Printer size={16} /> طباعة
        </button>
      </div>

      {/* الباقات */}
      <div className="print-area">
        <div className="bg-[#111] rounded-2xl p-6 border border-[#D4AF37]/20 mb-6">
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
            <Banknote size={20} className="text-[#D4AF37]" /> الباقات المتاحة
          </h2>
          {pricings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا توجد باقات مسجلة بعد</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pricings.map((p: any) => (
                <div key={p.id} className="bg-[#1a1a1a] rounded-xl p-5 border border-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition">
                  <h3 className="font-black text-white text-lg">{p.name}</h3>
                  <p className="text-2xl font-black text-[#D4AF37] mt-2">{Number(p.price).toLocaleString()} <span className="text-sm text-gray-400">ج.م</span></p>
                  {p.description && <p className="text-xs text-gray-400 mt-2 leading-relaxed">{p.description}</p>}
                  {p.duration && <p className="text-xs text-gray-500 mt-1">⏱ {p.duration} دقيقة</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* مناطق التسعير */}
        {regions.length > 0 && (
          <div className="bg-[#111] rounded-2xl p-6 border border-[#D4AF37]/20 mb-6">
            <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              📍 مناطق التسعير
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#D4AF37]/20">
                    <th className="text-right py-3 px-4 text-xs font-bold text-[#D4AF37] uppercase">المنطقة</th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-[#D4AF37] uppercase">السعر الأساسي</th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-[#D4AF37] uppercase">رسوم السفر</th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-[#D4AF37] uppercase">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {regions.map((r: any) => (
                    <tr key={r.id} className="border-b border-[#D4AF37]/5 hover:bg-[#1a1a1a]">
                      <td className="py-3 px-4 font-bold text-white">{r.regionName}</td>
                      <td className="py-3 px-4 text-center text-gray-300">{Number(r.basePrice).toLocaleString()} ج.م</td>
                      <td className="py-3 px-4 text-center text-gray-400">{Number(r.travelFee || 0).toLocaleString()} ج.م</td>
                      <td className="py-3 px-4 text-center font-black text-[#D4AF37]">{(Number(r.basePrice) + Number(r.travelFee || 0)).toLocaleString()} ج.م</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* نموذج الإضافة */}
      <div className="no-print">
        <PricingForm artistId={artist.id} artistSlug={slug} />
      </div>

      
    </div>
  )
}
