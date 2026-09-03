import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Music, Star, Award, Calendar, ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ArtistsPage() {
  const artists = await prisma.artist.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      bio: true,
      profileImage: true,
      _count: { select: { reviews: true, bookings: true } },
      reviews: { select: { rating: true } },
    },
  }).catch(() => []);

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* ═══ Header ═══ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-[#e8e4d9] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#111] to-[#232323] flex items-center justify-center shadow-lg">
              <span className="text-[#d4af37] text-2xl font-black">N</span>
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">Nooryi</p>
              <p className="text-[10px] text-[#b8941f] font-bold tracking-[0.25em] uppercase">Studio</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-bold text-gray-600 hover:text-[#b8941f] transition">الرئيسية</Link>
            <Link href="/artists" className="text-sm font-black text-[#b8941f]">الفنانين</Link>
            <Link href="/my-bookings" className="text-sm font-bold text-gray-600 hover:text-[#b8941f] transition">حجوزاتي</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-outline text-sm py-2.5">
              تسجيل الدخول
            </Link>
            <Link href="/register" className="btn-gold text-sm py-2.5">
              إنشاء حساب
            </Link>
          </div>
        </div>
      </header>

      {/* ═══ Hero ═══ */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-[#faf8f0] via-white to-[#faf8f0] overflow-hidden border-b border-[#e8e4d9]">
        <div className="absolute top-10 right-20 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-20 w-72 h-72 bg-[#b8941f]/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 lg:px-8">
          <div className="max-w-3xl">
            <div className="badge-gold mb-6">
              <Music size={14} />
              اكتشف أفضل الفنانين
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-4 leading-tight">
              فنانون{" "}
              <span className="gold-text">مميزون</span>
              <br />
              لفعاليات لا تُنسى
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
              اختر من بين نخبة من أفضل الفنانين والموسيقيين. كل فنان خضع لعملية تحقق صارمة لضمان أعلى مستوى من الاحترافية.
            </p>

            <div className="flex items-center gap-6 mt-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#b8941f] flex items-center justify-center shadow-md">
                  <Music size={20} className="text-[#111]" />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">+{artists.length}</p>
                  <p className="text-xs text-gray-500 font-bold">فنان متاح</p>
                </div>
              </div>
              <div className="w-px h-12 bg-[#e8e4d9]"></div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#111] to-[#232323] flex items-center justify-center shadow-md">
                  <Award size={20} className="text-[#d4af37]" />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">4.9★</p>
                  <p className="text-xs text-gray-500 font-bold">تقييم العملاء</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Grid ═══ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        {artists.length === 0 ? (
          <div className="card-pro text-center py-20">
            <Music className="mx-auto mb-4 text-gray-300" size={64} />
            <h3 className="text-2xl font-black text-gray-900 mb-2">لا يوجد فنانون حالياً</h3>
            <p className="text-gray-500">سيتم إضافة فنانين جدد قريباً</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artists.map((artist) => {
              const ratings = artist.reviews?.map((r) => r.rating) || [];
              const avgRating =
                ratings.length > 0
                  ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
                  : 0;

              return (
                <Link
                  key={artist.id}
                  href={`/artists/${artist.slug}`}
                  className="card-pro group overflow-hidden block"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-[#111] to-[#232323]">
                    {artist.profileImage ? (
                      <img
                        src={artist.profileImage}
                        alt={artist.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="text-[#d4af37]/50" size={64} />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent opacity-90"></div>

                    {avgRating > 0 && (
                      <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full flex items-center gap-1 shadow-lg">
                        <Star size={12} className="text-[#d4af37] fill-[#d4af37]" />
                        <span className="text-xs font-black text-gray-900">{avgRating.toFixed(1)}</span>
                      </div>
                    )}

                    {artist._count.bookings > 0 && (
                      <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#d4af37]/95 backdrop-blur-sm rounded-full flex items-center gap-1 shadow-lg">
                        <Calendar size={11} className="text-[#111]" />
                        <span className="text-xs font-black text-[#111]">{artist._count.bookings} حجز</span>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-black mb-1">{artist.name}</h3>
                      <p className="text-[#d4af37] text-sm font-bold">{artist.category}</p>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {artist.bio || "فنان محترف يقدم أداءً مميزاً"}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-[#e8e4d9]">
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Star size={13} className="text-[#d4af37] fill-[#d4af37]" />
                          <span className="font-black text-gray-900">
                            {avgRating > 0 ? avgRating.toFixed(1) : "جديد"}
                          </span>
                          <span className="text-gray-400">({artist._count.reviews})</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                        <span className="font-bold text-gray-500">{artist._count.bookings} حجز</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-black text-[#b8941f] group-hover:gap-2 transition-all">
                        عرض
                        <ChevronLeft size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="bg-gradient-to-br from-[#0a0a0a] to-[#232323] text-white py-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#b8941f] flex items-center justify-center">
              <span className="text-[#0a0a0a] text-lg font-black">N</span>
            </div>
            <div>
              <p className="text-lg font-black">Nooryi</p>
              <p className="text-[9px] text-[#d4af37] font-bold tracking-[0.25em] uppercase">Studio</p>
            </div>
          </div>
          <p className="text-xs text-white/50">© 2026 Nooryi Studio. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}