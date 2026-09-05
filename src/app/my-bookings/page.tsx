import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Calendar, Clock, MapPin, DollarSign, Music, FileText, ArrowLeft } from "lucide-react";
export const dynamic = "force-dynamic";
export default async function MyBookingsPage({ searchParams }: { searchParams: Promise<{ new?: string; id?: string; success?: string }> }) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const isNewBooking = params.new === "true" || params.success === "true";
  const newBookingId = params.id || null;
  if (!session?.user) redirect("/login?callbackUrl=/my-bookings");
  const userEmail = (session.user as any)?.email || "";
  const userId = (session.user as any)?.id || "";
  let bookings: any[] = [];
  try {
    // جلب كل الحجوزات ثم فلترتها في JS (حل جذري)
    const allBookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        artist: { select: { name: true, slug: true, profileImage: true, category: true } },
        venue: { select: { name: true, city: true } },
        payments: { select: { amount: true, status: true, createdAt: true } },
        customer: { select: { id: true, email: true, phone: true, userId: true } },
      },
      take: 100,
    });
    // فلتر: يطابق email أو userId أو customerId أو phone
    bookings = allBookings.filter((b: any) => {
      if (b.clientEmail && b.clientEmail.toLowerCase() === userEmail.toLowerCase()) return true;
      if (b.userId && b.userId === userId) return true;
      if (b.customer?.userId && b.customer.userId === userId) return true;
      if (b.customer?.email && b.customer.email.toLowerCase() === userEmail.toLowerCase()) return true;
      return false;
    });
    console.log("Total bookings:", allBookings.length, "Filtered:", bookings.length);
  } catch (e: any) { console.error("Error:", e); }
  const gs = (s: string) => { const u = (s||"").toUpperCase(); if (["CONFIRMED","APPROVED","ACCEPTED"].includes(u)) return {l:"مؤكد",c:"status-confirmed",i:"✓"}; if (["PENDING_APPROVAL","PENDING"].includes(u)) return {l:"قيد المراجعة",c:"status-pending",i:"⏳"}; if (["COMPLETED","DONE"].includes(u)) return {l:"مكتمل",c:"status-completed",i:"✓"}; return {l:"مرفوض",c:"status-rejected",i:"✕"}; };
  return (
    <div className="min-h-screen bg-white pt-20" dir="rtl">
      <main className="pb-20 px-4 lg:px-8 max-w-6xl mx-auto">
        <div className="mb-10">
          <div className="badge-gold mb-3">حسابي</div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">حجوزاتي <span className="gold-text">الخاصة</span></h1>
          {isNewBooking && (<div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6"><div className="flex items-start gap-4"><div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"><span className="text-white text-2xl">✓</span></div><div><h3 className="text-lg font-black text-green-900">تم إرسال حجزك بنجاح! 🎉</h3><p className="text-sm text-green-800">حجزك قيد المراجعة.</p>{newBookingId && <p className="text-xs font-mono bg-green-100 inline-block px-3 py-1 rounded mt-2">{newBookingId.slice(0,12)}...</p>}</div></div></div>)}
          <p className="text-gray-500">إدارة ومتابعة جميع حجوزاتك — {bookings.length} حجز</p>
        </div>
        {bookings.length === 0 ? (<div className="card-pro text-center py-20"><Calendar className="mx-auto text-gray-300 mb-4" size={64}/><h3 className="text-2xl font-black text-gray-900 mb-2">لا توجد حجوزات بعد</h3><Link href="/artists" className="btn-gold inline-flex"><Music size={18}/> تصفح الفنانين</Link></div>) : (
          <div className="grid md:grid-cols-2 gap-6">
            {bookings.map((b:any) => { const s=gs(b.status); return (
              <div key={b.id} className="card-pro overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-[#111] to-[#232323] overflow-hidden">
                  {b.artist?.profileImage ? <img src={b.artist.profileImage} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center"><Music size={48} className="text-[#d4af37]/50"/></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                  <div className="absolute top-4 right-4"><span className={`status-chip ${s.c}`}>{s.i} {s.l}</span></div>
                  <div className="absolute bottom-4 right-4 left-4"><p className="text-[#d4af37] text-xs font-bold mb-1">{b.artist?.category||"فنان"}</p><h3 className="text-2xl font-black text-white">{b.artist?.name}</h3></div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-start gap-2"><Calendar size={16} className="text-[#b8941f] mt-0.5"/><div><p className="text-xs text-gray-500">التاريخ</p><p className="text-sm font-bold">{b.date?new Date(b.date).toLocaleDateString("ar-EG"):"—"}</p></div></div>
                    <div className="flex items-start gap-2"><Clock size={16} className="text-[#b8941f] mt-0.5"/><div><p className="text-xs text-gray-500">الوقت</p><p className="text-sm font-bold">{b.timeSlot||"—"}</p></div></div>
                  </div>
                  <div className="flex items-start gap-2"><MapPin size={16} className="text-[#b8941f] mt-0.5"/><div><p className="text-xs text-gray-500">المكان</p><p className="text-sm font-bold">{b.venue?.name||"—"}</p></div></div>
                  <div className="flex items-start gap-2"><DollarSign size={16} className="text-[#b8941f] mt-0.5"/><div><p className="text-xs text-gray-500">المبلغ</p><p className="text-lg font-black">{(b.grossAmount||0).toLocaleString()} ج.م</p></div></div>
                  <div className="flex gap-2 pt-3 border-t border-[#e8e4d9]">
                    <Link href={`/invoice?id=${b.id}`} className="btn-gold flex-1 text-sm py-2.5"><FileText size={14}/> عرض الفاتورة</Link>
                    <Link href={`/artists/${b.artist?.slug}`} className="btn-outline flex-1 text-sm py-2.5"><ArrowLeft size={14}/> الفنان</Link>
                  </div>
                </div>
              </div>
            );})}
          </div>
        )}
      </main>
    </div>
  );
}
// build: 20260906014128
