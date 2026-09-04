import Link from "next/link";
import { 
  Music, Star, Shield, CreditCard, Zap,
  Award, CheckCircle2, Phone, Mail, MapPin, 
  ArrowLeft, Mic, Sparkles, ChevronRight
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import ArtistCarousel from "@/components/ArtistCarousel";
import SocialLinks from "@/components/SocialLinks";
import ThemeToggle from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

async function getFeaturedArtists() {
  try {
    const artists = await prisma.artist.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        _count: { select: { bookings: true, reviews: true } },
        reviews: { select: { rating: true } },
      },
    });

    return (artists || []).map((artist: any) => {
      const ratings = artist.reviews?.map((r: any) => r.rating) || [];
      const avgRating = ratings.length > 0
        ? ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length
        : 5.0;

      return {
        id: artist.id,
        name: artist.name,
        slug: artist.slug,
        category: artist.category,
        bio: artist.bio,
        profileImage: artist.profileImage,
        coverImage: artist.coverImage,
        rating: parseFloat(avgRating.toFixed(1)),
        reviewsCount: artist._count.reviews,
        bookingsCount: artist._count.bookings,
      };
    });
  } catch (error) {
    console.error("Error fetching artists:", error);
    return [];
  }
}
export default async function HomePage() {
  const featuredArtists = await getFeaturedArtists();

  return (
    <div className="min-h-screen bg-white dark:bg-[#111] dark:bg-[#0a0a0a] transition-colors duration-300" dir="rtl">
      {/* ═══════════ الترويسة ═══════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#111]/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] to-[#F4E5B8] rounded-2xl blur-sm group-hover:blur-md transition-all"></div>
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-white to-gray-100 dark:from-[#111] dark:to-[#333] flex items-center justify-center shadow-xl">
                  <span className="text-[#D4AF37] text-2xl font-black">N</span>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Nooryi</h1>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold tracking-[0.2em] uppercase">Studio</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-semibold text-gray-900 dark:text-white hover:text-[#D4AF37] transition">الرئيسية</Link>
              <Link href="/artists" className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition">الفنانين</Link>
              <Link href="/#about" className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition">من نحن</Link>
              <Link href="/#services" className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition">خدماتنا</Link>
              <Link href="/#contact" className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition">تواصل معنا</Link>
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-900 dark:text-white border-2 border-gray-200 rounded-xl hover:border-[#D4AF37] hover:text-[#D4AF37] transition"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#F4E5B8] text-[#111] text-sm font-black rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
              >
                <Sparkles size={16} />
                إنشاء حساب
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════ Hero Section ═══════════ */}
      {/* ═══════════ نخبة الفنانين (Carousel 3D) ═══════════ */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0a0a0a] dark:via-[#111] dark:to-[#0a0a0a] overflow-hidden">
        {/* خلفية متحركة - نقاط ذهبية */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-[10%] w-2 h-2 bg-[#D4AF37]/40 rounded-full animate-float-up"></div>
          <div className="absolute top-40 left-[15%] w-3 h-3 bg-[#D4AF37]/30 rounded-full animate-float-down"></div>
          <div className="absolute bottom-20 right-[20%] w-2 h-2 bg-[#F4E5B8]/30 rounded-full animate-float-up-delay"></div>
          <div className="absolute top-1/2 left-[8%] w-2 h-2 bg-[#D4AF37]/20 rounded-full animate-float-down-delay"></div>
          <div className="absolute top-[30%] right-[40%] w-1.5 h-1.5 bg-[#D4AF37]/50 rounded-full animate-float-up"></div>
          <div className="absolute bottom-[30%] left-[40%] w-2 h-2 bg-[#F4E5B8]/40 rounded-full animate-float-down-delay"></div>
        </div>

        {/* نوتات موسيقية متحركة */}
        <div className="absolute top-10 left-[20%] text-[#D4AF37]/50 animate-note-float hidden md:block pointer-events-none">
          <Music size={28} />
        </div>
        <div className="absolute top-1/3 right-[15%] text-[#F4E5B8]/40 animate-note-float-delay hidden md:block pointer-events-none">
          <Music size={22} />
        </div>
        <div className="absolute bottom-20 left-[30%] text-[#D4AF37]/30 animate-note-float hidden lg:block pointer-events-none">
          <Music size={20} />
        </div>
        <div className="absolute top-1/2 right-[8%] text-[#F4E5B8]/30 animate-note-float-delay hidden lg:block pointer-events-none">
          <Music size={26} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 lg:px-8">
          {/* اللوجو + الميكروفون */}
          <div className="flex items-center justify-center gap-6 mb-6 mt-12">
            {/* اللوجو N */}
            <div className="relative animate-float-up">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] to-[#F4E5B8] rounded-2xl blur-lg opacity-70"></div>
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-gray-100 dark:from-[#111] dark:to-[#333] border border-[#D4AF37]/40 flex items-center justify-center shadow-2xl">
                <span className="text-[#D4AF37] text-3xl font-black">N</span>
              </div>
            </div>

            {/* خط فاصل */}
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent"></div>

            {/* الميكروفون */}
            <div className="relative animate-mic-bounce">
              <div className="absolute inset-0 bg-[#D4AF37]/30 rounded-full blur-xl animate-pulse-gold"></div>
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center shadow-2xl shadow-[#D4AF37]/40 border-2 border-[#F4E5B8]/50">
                <Mic size={28} className="text-[#111]" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          

          {/* العنوان الرئيسي */}
          <h2 className="text-center text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
            اختر من{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[#D4AF37] via-[#F4E5B8] to-[#D4AF37] bg-clip-text text-transparent">
                نخبة الفنانين
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 300 12" fill="none">
                <path d="M2 8C75 2 225 2 298 8" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </span>
          </h2>

          {/* الوصف */}
          <p className="text-center text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-6">
            تصفح أفضل الفنانين المعتمدين لدينا واحجز من يناسب فعاليتك —
            <span className="text-[#D4AF37] font-semibold"> تجربة لا تُنسى</span>
          </p>

          {/* خط فاصل ذهبي مع نوتة */}
          <div className="flex items-center justify-center gap-3 mb-16">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#D4AF37]"></div>
            <Music size={18} className="text-[#D4AF37] animate-float-up" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#D4AF37]"></div>
          </div>

          {/* Carousel */}
          {(featuredArtists?.length || 0) > 0 ? (
            <div className="relative px-4 md:px-12 lg:px-20">
              <ArtistCarousel artists={featuredArtists || []} />
            </div>
          ) : (
            <div className="text-center py-16">
              <Music className="mx-auto text-[#D4AF37]/30 mb-4 animate-float-up" size={64} />
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">لا يوجد فنانين بعد</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">سيتم إضافة فنانين قريباً</p>
            </div>
          )}

          {/* زر عرض الكل */}
          <div className="text-center mt-16">
            <Link
              href="/artists"
              className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] font-black rounded-2xl hover:shadow-2xl hover:shadow-[#D4AF37]/40 hover:scale-105 transition-all duration-300 text-lg"
            >
              عرض جميع الفنانين
              <ChevronRight size={22} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ خدماتنا ═══════════ */}
      <section id="services" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-xs font-bold mb-3">لماذا نحن؟</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">تجربة حجز استثنائية</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">نوفر لك أعلى معايير الجودة والاحترافية في كل خطوة</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "فنانين معتمدين",
                desc: "جميع الفنانين يخضعون لعملية تحقق صارمة لضمان أعلى مستوى من الاحترافية",
              },
              {
                icon: CreditCard,
                title: "دفع آمن 100%",
                desc: "نظام دفع مشفر وآمن مع ضمان استرداد كامل في حالة الإلغاء",
              },
              {
                icon: Zap,
                title: "حجز سهل وسريع",
                desc: "احجز فنانك المفضل في دقائق مع تأكيد فوري ومتابعة مستمرة",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group bg-white dark:bg-[#111] rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-gray-100 dark:from-[#111] dark:to-[#333] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon size={32} className="text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ من نحن ═══════════ */}
      <section id="about" className="py-20 bg-white dark:bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-xs font-bold mb-3">من نحن</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-6">شريكك في نجاح فعالياتك</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                نحن منصة رائدة في مجال حجز الفنانين والموسيقيين للفعاليات والمناسبات.
                نجمع بين أفضل المواهب الفنية في مكان واحد، لنوفر لك تجربة حجز سلسة واحترافية.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                سواء كنت تبحث عن فرقة موسيقية لحفل زفاف، أو مغني لفعالية خاصة،
                أو حتى منسق أغاني لحفلة تخرج، تجد لدينا كل ما تحتاجه.
              </p>

              <div className="space-y-4">
                {[
                  "أكثر من 150 فنان محترف معتمد",
                  "نظام دفع آمن ومشفر 100%",
                  "دعم فني على مدار الساعة",
                  "ضمان استرداد كامل في حالة الإلغاء",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F4E5B8] flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={14} className="text-white" />
                    </div>
                    <span className="text-gray-700 font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-white to-gray-100 dark:from-[#111] dark:to-[#333] rounded-3xl p-8 shadow-2xl">
                <div className="bg-white dark:bg-[#111] rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#F4E5B8] flex items-center justify-center">
                      <span className="text-[#111] text-3xl font-black">N</span>
                    </div>
                    <div>
                      <p className="text-xl font-black text-gray-900 dark:text-white">Nooryi Studio</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">منصة حجز الفنانين</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: "سنوات الخبرة", value: "+5" },
                      { label: "الفنانين المعتمدين", value: "+150" },
                      { label: "الفعاليات الناجحة", value: "+500" },
                      { label: "رضا العملاء", value: "98%" },
                    ].map((stat, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0f0f0f] rounded-xl">
                        <span className="text-gray-600 dark:text-gray-400 font-semibold">{stat.label}</span>
                        <span className="text-2xl font-black bg-gradient-to-r from-[#D4AF37] to-[#F4E5B8] bg-clip-text text-transparent">
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-20 bg-gradient-to-br from-white to-gray-100 dark:from-[#111] dark:to-[#333]">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
            جاهز لبدء <span className="text-[#D4AF37]">رحلتك؟</span>
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            انضم إلى آلاف العملاء الذين يثقون بنا في تنظيم فعاليات لا تُنسى
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#F4E5B8] text-[#111] rounded-2xl font-black text-lg hover:shadow-2xl hover:scale-105 transition-all"
            >
              <Sparkles size={20} />
              إنشاء حساب مجاني
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-[#111]/10 backdrop-blur-sm border-2 border-white/20 text-white rounded-2xl font-black text-lg hover:bg-white dark:bg-[#111]/20 transition-all"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ تواصل معنا ═══════════ */}
      <section id="contact" className="py-20 bg-white dark:bg-[#111]">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-xs font-bold mb-3">تواصل معنا</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
              نحن هنا <span className="text-[#D4AF37]">لمساعدتك</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 text-center shadow-lg border-2 border-transparent hover:border-[#D4AF37] transition">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#111] flex items-center justify-center mb-4">
                <Phone size={28} className="text-[#D4AF37]" />
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">اتصل بنا</h3>
              <p className="text-gray-600 dark:text-gray-400" dir="ltr">+20 100 000 0000</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 text-center shadow-lg border-2 border-transparent hover:border-[#D4AF37] transition">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#F4E5B8] flex items-center justify-center mb-4">
                <Mail size={28} className="text-[#111]" />
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">راسلنا</h3>
              <p className="text-gray-600 dark:text-gray-400" dir="ltr">info@noorystudio.com</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 text-center shadow-lg border-2 border-transparent hover:border-[#D4AF37] transition">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#111] flex items-center justify-center mb-4">
                <MapPin size={28} className="text-[#D4AF37]" />
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">موقعنا</h3>
              <p className="text-gray-600 dark:text-gray-400">القاهرة، مصر</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ التذييل ═══════════ */}
      <footer className="bg-white dark:bg-[#111] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white to-gray-100 dark:from-[#111] dark:to-[#333] flex items-center justify-center">
                  <span className="text-[#D4AF37] text-2xl font-black">N</span>
                </div>
                <div>
                  <p className="text-xl font-black text-gray-900 dark:text-white">Nooryi</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold tracking-[0.2em] uppercase">Studio</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-md">
                منصة احترافية لحجز أفضل الفنانين والموسيقيين للفعاليات والمناسبات.
                نوفر لك تجربة حجز سلسة وآمنة بأعلى معايير الجودة.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-black text-gray-900 dark:text-white mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition">الرئيسية</Link></li>
                <li><Link href="/artists" className="text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition">الفنانين</Link></li>
                <li><Link href="/#about" className="text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition">من نحن</Link></li>
                <li><Link href="/#services" className="text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition">خدماتنا</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-black text-gray-900 dark:text-white mb-4">حسابك</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition">تسجيل الدخول</Link></li>
                <li><Link href="/register" className="text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition">إنشاء حساب</Link></li>
                <li><Link href="/my-bookings" className="text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition">حجوزاتي</Link></li>
              </ul>
            </div>
          </div>

          <SocialLinks />
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">© 2026 Nooryi Studio. جميع الحقوق محفوظة.</p>
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <Award size={16} />
              <span className="text-xs font-bold">منصة معتمدة رسمياً</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}