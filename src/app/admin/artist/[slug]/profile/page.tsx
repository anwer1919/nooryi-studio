import { getManagerArtist } from "@/lib/managerAuth"
import { prisma } from "@/lib/prisma"
import { Music, Edit } from "lucide-react"
import Link from "next/link"

export default async function ArtistProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { artist } = await getManagerArtist(slug)

  const fullArtist = await prisma.artist.findUnique({ where: { id: artist.id } })
  if (!fullArtist) return null

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2"><Music size={28} className="text-[#F5A623]" /> بروفايل {fullArtist.name}</h1>
        <Link href={`/admin/artists/${slug}/edit`} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F5A623] to-[#E8961A] text-[#111] rounded-xl font-bold text-sm hover:shadow-lg transition">
          <Edit size={14} /> تعديل
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="font-black text-gray-900 dark:text-white mb-4">المعلومات الأساسية</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">الاسم:</span><span className="font-bold text-gray-900 dark:text-white">{fullArtist.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">الفئة:</span><span className="font-bold text-gray-900 dark:text-white">{fullArtist.category || "—"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">الحالة:</span><span className="font-bold text-green-600">{fullArtist.status}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">عمولة المنصة:</span><span className="font-bold text-[#F5A623]">{fullArtist.commissionRate}%</span></div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="font-black text-gray-900 dark:text-white mb-4">الحسابات البنكية</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">البنك:</span><span className="font-bold text-gray-900 dark:text-white">{fullArtist.bankName || "—"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">رقم الحساب:</span><span className="font-mono font-bold text-gray-900 dark:text-white" dir="ltr">{fullArtist.bankAccount || "—"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">IBAN:</span><span className="font-mono text-xs text-gray-900 dark:text-white" dir="ltr">{fullArtist.iban || "—"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">فودافون كاش:</span><span className="font-mono font-bold text-gray-900 dark:text-white" dir="ltr">{fullArtist.vodafoneCash || "—"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">إنستا باي:</span><span className="font-mono font-bold text-gray-900 dark:text-white" dir="ltr">{fullArtist.instaPay || "—"}</span></div>
          </div>
        </div>
      </div>

      {fullArtist.bio && (
        <div className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="font-black text-gray-900 dark:text-white mb-3">نبذة</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{fullArtist.bio}</p>
        </div>
      )}
    </div>
  )
}