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

  let bookings: any[] = [];
  try {
    // ✅ جلب customer المرتبط بالـ user
    const userCustomer = await prisma.customer.findFirst({
      where: { 
        OR: [
          { email: userEmail },
          { userId: (session.user as any).id }
        ]
      },
      select: { id: true }
    });

    const searchConditions: any[] = [
      { clientEmail: userEmail },
      { userId: (session.user as any).id },
    ];
    
    if (userCustomer) {
      searchConditions.push({ customerId: userCustomer.id });
    }

    bookings = await prisma.booking.findMany({
      where: { OR: searchConditions },
      orderBy: { createdAt: "desc" },
      include: {
        artist: { select: { name: true, slug: true, profileImage: true, category: true } },
        venue: { select: { name: true, city: true } },
        payments: { select: { amount: true, status: true, createdAt: true } },
      },
    });
  } catch (e: any) {
    console.error("My bookings error:", e);
  }

  const getStatusInfo = (status: string) => {
    const s = (status || "").toUpperCase();
    if (["CONFIRMED", "APPROVED", "ACCEPTED"].includes(s)) return { label: "مؤكد", class: "status-confirmed", icon: "✓" };
    if (["PENDING_APPROVAL", "PENDING"].includes(s)) return { label: "قيد المراجعة", class: "status-pending", icon: "⏳" };
    if (["COMPLETED", "DONE"].includes(s)) return { label: "مكتمل", class: "status-completed", icon: "✓" };
    return { label: "مرفوض", class: "status-rejected", icon: "✕" };
  };

  return (
    <div className="min-h-screen bg-white pt-20" dir="rtl">
      <main className="pb-20 px-4 lg:px-8 max-w-6xl mx-auto">
        <div className="mb-10">
          <div className="badge-gold mb-3">حسابي</div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
            حجوزاتي <span className="gold-text">الخاصة</span>
          </h1>
          {isNewBooking && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 animate-[fadeIn_0.5s]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-2xl">✓</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-green-900 mb-1">
                  تم إرسال حجزك بنجاح! 🎉
                </h3>
                <p className="text-sm text-green-800 mb-2">
                  حجزك الآن <strong>قيد المراجعة</strong> من قبل إدارة المنصة.
                  ستتلقى إشعاراً فور الموافقة لتتمكن من إتمام عملية الدفع.
                </p>
                {newBookingId && (
                  <p className="text-xs text-green-700 font-mono bg-green-100 inline-block px-3 py-1 rounded">
                    رقم الحجز: {newBookingId.slice(0, 12)}...
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        <p className="text-gray-500">إدارة ومتابعة جميع حجوزاتك — {bookings.length} حجز</p>
        </div>

        {bookings.length === 0 ? (
          <div className="card-pro text-center py-20">
            <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-2xl font-black text-gray-900 mb-2">لا توجد حجوزات بعد</h3>
            <p className="text-gray-500 mb-6">ابدأ رحلتك بحجز فنانك المفضل</p>
            <Link href="/artists" className="btn-gold inline-flex">
              <Music size={18} />
              تصفح الفنانين
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {bookings.map((b: any) => {
              const status = getStatusInfo(b.status);
              return (
                <div key={b.id} className="card-pro overflow-hidden">
                  <div className="relative h-48 bg-gradient-to-br from-[#111] to-[#232323] overflow-hidden">
                    {b.artist?.profileImage ? (
                      <img src={b.artist.profileImage} alt={b.artist.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music size={48} className="text-[#d4af37]/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      <span className={`status-chip ${status.class}`}>{status.icon} {status.label}</span>
                    </div>
                    <div className="absolute bottom-4 right-4 left-4">
                      <p className="text-[#d4af37] text-xs font-bold mb-1">{b.artist?.category || "فنان"}</p>
                      <h3 className="text-2xl font-black text-white">{b.artist?.name}</h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <Calendar size={16} className="text-[#b8941f] mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">التاريخ</p>
                          <p className="text-sm font-bold text-gray-900">
                            {b.date ? new Date(b.date).toLocaleDateString("ar-EG") : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock size={16} className="text-[#b8941f] mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">الوقت</p>
                          <p className="text-sm font-bold text-gray-900">{b.timeSlot || "—"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-[#b8941f] mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">المكان</p>
                        <p className="text-sm font-bold text-gray-900">
                          {b.venue?.name || "—"}
                          {b.venue?.city && <span className="text-gray-500"> • {b.venue.city}</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <DollarSign size={16} className="text-[#b8941f] mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">المبلغ الإجمالي</p>
                        <p className="text-lg font-black text-gray-900">
                          {(b.grossAmount || 0).toLocaleString()} ج.م
                        </p>
                        {b.depositAmount > 0 && (
                          <p className="text-xs text-gray-500">
                            عربون: {b.depositAmount.toLocaleString()} • متبقي: {(b.remainingAmount || 0).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-[#e8e4d9]">
                      <Link
                        href={`/invoice?id=${b.id}`}
                        className="btn-gold flex-1 text-sm py-2.5"
                      >
                        <FileText size={14} />
                        عرض الفاتورة
                      </Link>
                      <Link
                        href={`/artists/${b.artist?.slug}`}
                        className="btn-outline flex-1 text-sm py-2.5"
                      >
                        <ArrowLeft size={14} />
                        الفنان
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}