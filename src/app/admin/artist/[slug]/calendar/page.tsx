import { getManagerArtist } from "@/lib/managerAuth"
import { Calendar } from "lucide-react"
import Link from "next/link"

export default async function ArtistCalendar({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { artist } = await getManagerArtist(slug)

  return (
    <div dir="rtl" className="space-y-6">
      <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2"><Calendar size={28} className="text-[#D4AF37]" /> تقويم {artist.name}</h1>
      <div className="bg-white dark:bg-[#111] rounded-2xl p-8 border border-gray-200 dark:border-gray-800 text-center">
        <Calendar size={48} className="mx-auto text-[#D4AF37]/30 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 mb-4">إدارة التقويم والتوفر</p>
        <Link href={`/admin/artists/${slug}/availability`} className="inline-block px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] rounded-xl font-black hover:shadow-lg transition">
          فتح إدارة التقويم ←
        </Link>
      </div>
    </div>
  )
}