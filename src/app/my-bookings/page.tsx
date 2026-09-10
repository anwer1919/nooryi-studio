import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Calendar, Clock, MapPin, DollarSign, Music, FileText, Printer, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function MyBookingsPage({ searchParams }: { searchParams: Promise<{ new?: string; id?: string; success?: string }> }) {
  const session = await auth()
  const params = await searchParams
  const isNewBooking = params.new === "true" || params.success === "true"
  const newBookingId = params.id || null

  if (!session?.user) redirect("/login?callbackUrl=/my-bookings")

  const userEmail = ((session.user as any)?.email || "").toLowerCase()
  const userId = (session.user as any)?.id || ""

  let bookings: any[] = []
  try {
    const conditions: any[] = []
    if (userEmail) conditions.push({ clientEmail: userEmail })
    if (userId) conditions.push({ userId: userId })
    if (conditions.length > 0) {
      bookings = await prisma.booking.findMany({
        where: { OR: conditions },
        orderBy: { createdAt: "desc" },
        include: {
          artist: { select: { name: true, slug: true, profileImage: true, category: true } },
          venue: { select: { name: true, city: true } },
          payments: { select: { amount: true, status: true, createdAt: true } },
        },
      })
    }
  } catch (e: any) { console.error("[my-bookings]", e.message) }

  const gs = (s: string) => {
    const u = (s || "").toUpperCase()
    if (["CONFIRMED","APPROVED","ACCEPTED"].includes(u)) return { l: "مؤكد", cls: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle2 }
    if (["PENDING_APPROVAL","PENDING"].includes(u)) return { l: "قيد المراجعة", cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: AlertCircle }
    if (["COMPLETED","DONE"].includes(u)) return { l: "مكتمل", cls: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: CheckCircle2 }
    return { l: "مرفوض", cls: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle }
  }

  const totalSpent = bookings.filter(b => ["CONFIRMED","COMPLETED","APPROVED"].includes((b.status||"").toUpperCase())).reduce((s,b) => s + Number(b.grossAmount||0), 0)

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20" dir="rtl">
      <main className="pb-20 px-4 lg:px-8 max-w-6xl mx-auto">
        <div className="mb-10">
          <div className="badge-gold mb-3">حسابي</div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">حجوزاتي <span className="gold-text">الخاصة</span></h1>
          <p className="text-gray-400">إدارة ومتابعة جميع حجوزاتك — {bookings.length} حجز</p>
        </div>

        {isNewBooking && (
          <div className="mb-8 bg-green-500/10 border-2 border-green-500/30 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"><CheckCircle2 size={24} className="text-white"/></div>
            <div><h3 className="text-lg font-black text-green-400">تم إرسال حجزك بنجاح! 🎉</h3><p className="text-sm text-green-300/80 mt-1">حجزك قيد المراجعة</p>{newBookingId && <p className="text-xs font-mono bg-green-500/20 text-green-300 inline-block px-3 py-1 rounded mt-2">{newBookingId.slice(0,12)}...</p>}</div>
          </div>
        )}

        {bookings.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#111] rounded-2xl p-5 border border-[#F5A623]/20"><p className="text-xs text-gray-400 mb-1">الإجمالي</p><p className="text-2xl font-black text-white">{bookings.length}</p></div>
            <div className="bg-[#111] rounded-2xl p-5 border border-green-500/20"><p className="text-xs text-gray-400 mb-1">مؤكدة</p><p className="text-2xl font-black text-green-400">{bookings.filter(b=>["CONFIRMED","APPROVED","ACCEPTED","COMPLETED"].includes((b.status||"").toUpperCase())).length}</p></div>
            <div className="bg-[#111] rounded-2xl p-5 border border-yellow-500/20"><p className="text-xs text-gray-400 mb-1">قيد المراجعة</p><p className="text-2xl font-black text-yellow-400">{bookings.filter(b=>["PENDING_APPROVAL","PENDING"].includes((b.status||"").toUpperCase())).length}</p></div>
            <div className="bg-[#111] rounded-2xl p-5 border border-[#F5A623]/20"><p className="text-xs text-gray-400 mb-1">المدفوع</p><p className="text-xl font-black text-[#F5A623]">{totalSpent.toLocaleString()} <span className="text-xs">ج.م</span></p></div>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-[#111] rounded-2xl p-12 text-center border border-[#F5A623]/20">
            <Calendar className="mx-auto text-gray-600 mb-4" size={64}/>
            <h3 className="text-2xl font-black text-white mb-2">لا توجد حجوزات بعد</h3>
            <p className="text-gray-400 mb-6">تصفح الفنانين واحجز من يناسب فعاليتك</p>
            <Link href="/artists" className="btn-gold inline-flex"><Music size={18}/> تصفح الفنانين</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b: any) => {
              const s = gs(b.status)
              const StatusIcon = s.icon
              const paid = (b.payments||[]).filter((p:any)=>p.status==="COMPLETED").reduce((sum:number,p:any)=>sum+Number(p.amount||0),0)
              const remaining = Math.max(0, Number(b.grossAmount||0)-paid)
              return (
                <div key={b.id} className="bg-[#111] rounded-2xl border border-[#F5A623]/10 overflow-hidden hover:border-[#F5A623]/30 transition-all">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative w-full md:w-48 h-40 md:h-auto bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex-shrink-0 overflow-hidden">
                      {b.artist?.profileImage ? <img src={b.artist.profileImage} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center"><Music size={40} className="text-[#F5A623]/30"/></div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute bottom-3 right-3 left-3"><p className="text-[#F5A623] text-[10px] font-bold uppercase">{b.artist?.category||"فنان"}</p><p className="text-white font-black text-sm truncate">{b.artist?.name||"—"}</p></div>
                    </div>
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div><div className="flex items-center gap-2 mb-1"><StatusIcon size={16} className={s.cls.split(" ")[1]}/><span className={"text-xs px-2.5 py-1 rounded-full font-bold border "+s.cls}>{s.l}</span></div><p className="text-xs text-gray-500 font-mono mt-1">{b.id.slice(0,12).toUpperCase()}</p></div>
                        <div className="text-left"><p className="text-xs text-gray-500">المبلغ</p><p className="text-xl font-black text-[#F5A623]">{Number(b.grossAmount||0).toLocaleString()} ج.م</p></div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="flex items-center gap-2"><Calendar size={14} className="text-[#F5A623]"/><div><p className="text-[10px] text-gray-500">التاريخ</p><p className="text-xs font-bold text-white">{b.date?new Date(b.date).toLocaleDateString("ar-EG"):"—"}</p></div></div>
                        <div className="flex items-center gap-2"><Clock size={14} className="text-[#F5A623]"/><div><p className="text-[10px] text-gray-500">الوقت</p><p className="text-xs font-bold text-white">{b.timeSlot||"—"}</p></div></div>
                        <div className="flex items-center gap-2"><MapPin size={14} className="text-[#F5A623]"/><div><p className="text-[10px] text-gray-500">المكان</p><p className="text-xs font-bold text-white truncate">{b.venue?.name||"—"}</p></div></div>
                        <div className="flex items-center gap-2"><DollarSign size={14} className="text-[#F5A623]"/><div><p className="text-[10px] text-gray-500">المدفوع</p><p className="text-xs font-bold text-green-400">{paid.toLocaleString()} ج.م</p></div></div>
                      </div>
                      {Number(b.grossAmount||0)>0 && <div className="mb-4"><div className="flex justify-between text-[10px] text-gray-500 mb-1"><span>مدفوع: {paid.toLocaleString()}</span><span>متبقي: {remaining.toLocaleString()}</span></div><div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#F5A623] to-[#E8961A] rounded-full" style={{width:`${Math.min(100,(paid/Number(b.grossAmount||1))*100)}%`}}></div></div></div>}
                      <div className="flex gap-2 pt-3 border-t border-[#F5A623]/10">
                        <Link href={"/invoice?id="+b.id} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#F5A623]/10 text-[#F5A623] rounded-xl text-xs font-bold hover:bg-[#F5A623]/20 transition"><FileText size={14}/> الفاتورة</Link>
                        <Link href={"/invoice/print?id="+b.id} target="_blank" className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#1a1a1a] text-gray-300 rounded-xl text-xs font-bold hover:bg-[#222] transition border border-[#F5A623]/20"><Printer size={14}/> طباعة</Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}