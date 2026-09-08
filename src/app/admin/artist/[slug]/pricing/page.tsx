import { getManagerArtist } from "@/lib/managerAuth"
import { prisma } from "@/lib/prisma"
import { Banknote, Printer } from "lucide-react"
import PricingClient from "./PricingClient"

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
      <div className="flex items-center justify-between flex-wrap gap-4 no-print">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2"><Banknote size={28} className="text-[#D4AF37]" /> تسعير {artist.name}</h1>
          <p className="text-gray-400 text-sm mt-1">{pricings.length} باقة • {(regions || []).length} منطقة</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-[#D4AF37] rounded-xl font-bold text-sm hover:bg-[#222] transition border border-[#D4AF37]/20">
          <Printer size={16} /> طباعة
        </button>
      </div>
      <PricingClient artistId={artist.id} artistSlug={slug} pricings={JSON.parse(JSON.stringify(pricings))} regions={JSON.parse(JSON.stringify(regions || []))} />
    </div>
  )
}