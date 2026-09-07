import { getManagerArtist } from "@/lib/managerAuth"
import { prisma } from "@/lib/prisma"
import { Banknote } from "lucide-react"
import Link from "next/link"

export default async function ArtistPricing({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { artist } = await getManagerArtist(slug)

  const pricings = await prisma.pricing.findMany({ where: { artistId: artist.id }, orderBy: { price: "asc" } })

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2"><Banknote size={28} className="text-[#D4AF37]" /> تسعير {artist.name}</h1>
        <Link href={`/admin/artists/${slug}/pricing`} className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] rounded-xl font-bold text-sm hover:shadow-lg transition">إدارة التسعير ←</Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pricings.map((p: any) => (
          <div key={p.id} className="bg-white dark:bg-[#111] rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
            <h3 className="font-black text-gray-900 dark:text-white">{p.name}</h3>
            <p className="text-2xl font-black text-[#D4AF37] mt-2">{Number(p.price).toLocaleString()} ج.م</p>
            {p.description && <p className="text-xs text-gray-500 mt-2">{p.description}</p>}
            {p.duration && <p className="text-xs text-gray-400 mt-1">{p.duration} دقيقة</p>}
          </div>
        ))}
        {pricings.length === 0 && <p className="col-span-full text-center py-12 text-gray-400">لا توجد أسعار محددة بعد</p>}
      </div>
    </div>
  )
}