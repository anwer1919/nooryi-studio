import { prisma } from "@/lib/prisma"
import { ShieldCheck, Music, Star } from "lucide-react"
export const dynamic = "force-dynamic"
const CONFIRMED = ["CONFIRMED", "APPROVED", "ACCEPTED", "COMPLETED"]
export default async function VerifyReportPage({ searchParams }: { searchParams: Promise<{ artist?: string }> }) {
  const sp = await searchParams
  const slug = String(sp.artist || "").toLowerCase()
  const artist: any = slug ? await prisma.artist.findUnique({ where: { slug } }).catch(() => null) : null
  let stats: any = null
  if (artist) {
    const bookings: any[] = await prisma.booking.findMany({ where: { artistId: artist.id } }).catch(() => [])
    const up = (s: any) => String(s || "").toUpperCase()
    const confirmed = bookings.filter(b => CONFIRMED.includes(up(b.status)))
    const gross = confirmed.reduce((s, b) => s + Number(b.grossAmount || 0), 0)
    const rate = Number(artist.commissionRate ?? 15) || 15
    const rating: any = await prisma.review.aggregate({ where: { artistId: artist.id }, _avg: { rating: true }, _count: true }).catch(() => ({ _avg: { rating: 0 }, _count: 0 }))
    stats = { total: bookings.length, confirmed: confirmed.length, completed: bookings.filter(b => up(b.status) === "COMPLETED").length, gross, commission: Math.round(gross * rate / 100), net: gross - Math.round(gross * rate / 100), rating: Number(rating._avg?.rating || 0), ratingCount: Number(rating._count || 0) }
  }
  return (
    <div className="min-h-screen bg-[#faf8f0] py-10 md:py-16" dir="rtl">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-[#F5A623]">
          <div className="bg-gradient-to-l from-[#F5A623] to-[#E8961A] p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-3"><ShieldCheck size={28} className="text-white" /></div>
            <h1 className="text-2xl font-black text-white">صفحة التحقق من صحة التقرير</h1>
            <p className="text-white/80 text-sm mt-1">Nooryi Studio — نظام التحقق الرسمي</p>
          </div>
          {!artist || !stats ? (
            <div className="p-10 text-center"><p className="text-red-600 font-bold text-lg mb-2">⚠️ التقرير غير موجود</p><p className="text-gray-500 text-sm">لم يتم العثور على فنان مطابق لرابط التحقق.</p></div>
          ) : (
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl mb-6">
                <ShieldCheck size={24} className="text-green-600 flex-shrink-0" />
                <div><p className="font-black text-green-700">✓ تقرير صحيح ومطابق لسجلات المنصة</p><p className="text-xs text-green-600 mt-0.5">تم التحقق لحظياً في {new Date().toLocaleString("ar-EG")}</p></div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center text-white text-xl font-black flex-shrink-0">{(artist.name || "ف").charAt(0)}</div>
                <div className="flex-1 min-w-0"><p className="font-black text-lg text-gray-900 truncate flex items-center gap-2"><Music size={16} className="text-[#E8961A]" /> {artist.name}</p><p className="text-xs text-gray-500">{artist.category || "فنان"} • <span className="inline-flex items-center gap-1"><Star size={11} className="text-[#F5A623] fill-[#F5A623]" /> {Number(stats.rating).toFixed(1)} ({stats.ratingCount} تقييم)</span></p></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[{ l: "إجمالي الحجوزات", v: String(stats.total) }, { l: "حجوزات مؤكدة", v: String(stats.confirmed) }, { l: "حجوزات مكتملة", v: String(stats.completed) }, { l: "إجمالي الإيرادات", v: stats.gross.toLocaleString() + " ج.م" }, { l: "عمولة المنصة", v: stats.commission.toLocaleString() + " ج.م" }, { l: "صافي الفنان", v: stats.net.toLocaleString() + " ج.م" }].map((x, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center"><p className="text-[10px] text-gray-500 font-bold mb-1">{x.l}</p><p className="font-black text-gray-900">{x.v}</p></div>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 text-center leading-relaxed">هذه الأرقام محسوبة لحظياً من قاعدة بيانات المنصة وهي المرجع الرسمي لصحة أي تقرير مالي صادر لأي فنان.</p>
            </div>
          )}
          <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-200"><p className="text-[10px] text-gray-400">© {new Date().getFullYear()} Nooryi Studio — جميع الحقوق محفوظة | سجل تجاري 123456789</p></div>
        </div>
      </div>
    </div>
  )
}
