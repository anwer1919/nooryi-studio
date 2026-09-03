import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  Music, Star, Calendar, MapPin, DollarSign, Clock, Award,
  Users, ChevronRight, CheckCircle2, Play, Heart, Share2,
  ArrowRight, Sparkles, Phone, Mail, MessageCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ArtistDetailPage({ params }: { params: { slug: string } }) {
  const artist = await prisma.artist.findUnique({
    where: { slug: params.slug },
    include: {
      _count: { select: { bookings: true, reviews: true } },
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
      availability: {
        where: { date: { gte: new Date() } },
        take: 10,
        orderBy: { date: "asc" },
      },
    },
  });

  if (!artist) notFound();

  const ratings = artist.reviews?.map((r: any) => r.rating) || [];
  const avgRating = ratings.length > 0
    ? (ratings.reduce((s: number, r: number) => s + r, 0) / ratings.length).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Hero */}
      <div className="relative h-[500px] lg:h-[600px] overflow-hidden">
        {artist.coverImage || artist.profileImage ? (
          <img
            src={artist.coverImage || artist.profileImage}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#111] to-[#232323]"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20"></div>

        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <span className="text-[#d4af37] text-lg font-black">N</span>
              </div>
              <span className="text-white font-black">Nooryi</span>
            </Link>
            <Link href="/artists" className="btn-outline text-white border-white/30 hover:bg-white/10 text-sm py-2">
              <ArrowRight size={14} />
              العودة
            </Link>
          </div>
        </header>

        {/* معلومات الفنان */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <div className="badge-gold" style={{ background: "rgba(212, 175, 55, 0.2)", borderColor: "rgba(212, 175, 55, 0.4)" }}>
                <Sparkles size={12} className="text-[#d4af37]" />
                <span className="text-[#d4af37]">{artist.category || "فنان"}</span>
              </div>
              {artist._count.bookings > 0 && (
                <div className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-bold text-white">
                  {artist._count.bookings} حجز ناجح
                </div>
              )}
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-white mb-4">{artist.name}</h1>
            <p className="text-white/70 text-lg max-w-2xl leading-relaxed mb-6">
              {artist.bio || "فنان محترف يقدم أداءً استثنائياً في جميع الفعاليات"}
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-white">
                <Star size={20} className="text-[#d4af37] fill-[#d4af37]" />
                <span className="font-black text-xl">{avgRating}</span>
                <span className="text-white/60 text-sm">({artist._count.reviews} تقييم)</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="flex items-center gap-2 text-white/80">
                <Award size={18} className="text-[#d4af37]" />
                <span className="text-sm font-semibold">فنان معتمد</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="flex items-center gap-2 text-white/80">
                <Calendar size={18} className="text-[#d4af37]" />
                <span className="text-sm font-semibold">متاح للحجز</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* المحتوى الرئيسي */}
          <div className="lg:col-span-2 space-y-10">
            {/* نبذة */}
            <section className="card-pro p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <Music size={24} className="text-[#b8941f]" />
                نبذة عن الفنان
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {artist.bio || "فنان محترف بخبرة واسعة في مجال الموسيقى والأداء الفني. يقدم عروضاً استثنائية تتناسب مع جميع أنواع الفعاليات."}
              </p>

              {artist.genres && artist.genres.length > 0 && (
                <div className="mt-6 pt-6 border-t border-[#e8e4d9]">
                  <p className="text-sm font-bold text-gray-500 mb-3">التخصصات:</p>
                  <div className="flex flex-wrap gap-2">
                    {artist.genres.map((g: string, i: number) => (
                      <span key={i} className="px-4 py-2 bg-[#faf8f0] border border-[#e8e4d9] rounded-full text-sm font-bold text-gray-700">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* التوافر */}
            <section className="card-pro p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={24} className="text-[#b8941f]" />
                المواعيد المتاحة
              </h2>
              {artist.availability.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {artist.availability.map((slot: any) => (
                    <Link
                      key={slot.id}
                      href={`/booking/${artist.slug}?date=${slot.id}`}
                      className="p-4 bg-[#faf8f0] border-2 border-[#e8e4d9] rounded-2xl hover:border-[#d4af37] hover:bg-white transition group"
                    >
                      <p className="text-xs text-gray-500 mb-1">
                        {new Date(slot.date).toLocaleDateString("ar-EG", { weekday: "long" })}
                      </p>
                      <p className="font-black text-gray-900 mb-2">
                        {new Date(slot.date).toLocaleDateString("ar-EG")}
                      </p>
                      <p className="text-xs text-[#b8941f] font-bold group-hover:font-black">
                        احجز هذا التاريخ ←
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">لا توجد مواعيد متاحة حالياً</p>
              )}
            </section>

            {/* التقييمات */}
            <section className="card-pro p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Star size={24} className="text-[#b8941f] fill-[#b8941f]" />
                تقييمات العملاء
              </h2>
              {artist.reviews.length > 0 ? (
                <div className="space-y-4">
                  {artist.reviews.map((r: any) => (
                    <div key={r.id} className="p-5 bg-[#faf8f0] rounded-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8941f] flex items-center justify-center text-white font-black">
                            {(r.user?.name || "ع")[0]}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{r.user?.name || "عميل"}</p>
                            <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString("ar-EG")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < r.rating ? "text-[#d4af37] fill-[#d4af37]" : "text-gray-300"}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{r.comment || "تقييم ممتاز"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">لا توجد تقييمات بعد</p>
              )}
            </section>
          </div>

          {/* بطاقة الحجز الثابتة */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 card-pro p-6 space-y-6">
              <div className="text-center pb-6 border-b border-[#e8e4d9]">
                <p className="text-sm text-gray-500 mb-2">السعر يبدأ من</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-black gold-text">
                    {(artist.basePrice || 1000).toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-sm">ج.م / ساعة</span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#b8941f]" />
                    دفع آمن 100%
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#b8941f]" />
                    ضمان استرداد
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#b8941f]" />
                    تأكيد فوري
                  </span>
                </div>
              </div>

              <Link href={`/booking/${artist.slug}`} className="btn-gold w-full py-4 text-base">
                <Calendar size={18} />
                احجز الآن
              </Link>

              <div className="grid grid-cols-2 gap-2">
                <button className="btn-outline text-sm py-3">
                  <Heart size={14} />
                  إضافة للمفضلة
                </button>
                <button className="btn-outline text-sm py-3">
                  <Share2 size={14} />
                  مشاركة
                </button>
              </div>

              <div className="pt-6 border-t border-[#e8e4d9] space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">تواصل معنا</p>
                <a href="tel:+201000000000" className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#b8941f] transition">
                  <Phone size={14} />
                  <span dir="ltr">+20 100 000 0000</span>
                </a>
                <a href="mailto:info@noorystudio.com" className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#b8941f] transition">
                  <Mail size={14} />
                  <span dir="ltr">info@noorystudio.com</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
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