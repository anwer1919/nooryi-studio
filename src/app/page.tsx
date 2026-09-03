import Link from "next/link";
import { 
  Music, Star, Shield, CreditCard, Zap,
  Award, CheckCircle2, Phone, Mail, MapPin, 
  ArrowLeft, Sparkles, ChevronRight
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getFeaturedArtists() {
  try {
    const artists = await prisma.artist.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
    return artists;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featuredArtists = await getFeaturedArtists();

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* ═══════════ الترويسة ═══════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] to-[#F4E5B8] rounded-2xl blur-sm group-hover:blur-md transition-all"></div>
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#111] to-[#333] flex items-center justify-center shadow-xl">
                  <span className="text-[#D4AF37] text-2xl font-black">N</span>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900 tracking-tight">Nooryi</h1>
                <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase">Studio</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-semibold text-gray-900 hover:text-[#D4AF37] transition">الرئيسية</Link>
              <Link href="/artists" className="text-sm font-semibold text-gray-600 hover:text-[#D4AF37] transition">الفنانين</Link>
              <Link href="/#about" className="text-sm font-semibold text-gray-600 hover:text-[#D4AF37] transition">من نحن</Link>
              <Link href="/#services" className="text-sm font-semibold text-gray-600 hover:text-[#D4AF37] transition">خدماتنا</Link>
              <Link href="/#contact" className="text-sm font-semibold text-gray-600 hover:text-[#D4AF37] transition">تواصل معنا</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-900 border-2 border-gray-200 rounded-xl hover:border-[#D4AF37] hover:text-[#D4AF37] transition"
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
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-[#D4AF37]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37]/10 to-[#F4E5B8]/10 border border-[#D4AF37]/20 rounded-full mb-8">
              <Sparkles size={14} className="text-[#D4AF37]" />
              <span className="text-sm font-bold text-gray-900">منصة حجز الفنانين الأولى</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-[1.1] tracking-tight">
              احجز أفضل{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] bg-clip-text text-transparent">الفنانين</span>
                <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                  <path d="M2 8C50 2 150 2 198 8" stroke="#D4AF37" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </span>
              <br />
              لفعالياتك المميزة
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              منصة احترافية تجمع بين أفضل الفنانين والموسيقيين. 
              احجز بسهولة، ادفع بأمان، واستمتع بتجربة لا تُنسى.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/artists"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#111] to-[#333] text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
              >
                <Music size={22} />
                تصفح الفنانين
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#F4E5B8] text-[#111] rounded-2xl font-black text-lg hover:shadow-2xl hover:scale-105 transition-all"
              >
                <Sparkles size={20} />
                ابدأ الآن مجاناً
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#D4AF37] to-[#F4E5B8] bg-clip-text text-transparent mb-2">+150</div>
                <div className="text-sm text-gray-600 font-semibold">فنان محترف</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#D4AF37] to-[#F4E5B8] bg-clip-text text-transparent mb-2">+500</div>
                <div className="text-sm text-gray-600 font-semibold">فعالية ناجحة</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#D4AF37] to-[#F4E5B8] bg-clip-text text-transparent mb-2">4.9★</div>
                <div className="text-sm text-gray-600 font-semibold">تقييم العملاء</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ فنانون مميزون ═══════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="inline-block px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-xs font-bold mb-3">فنانون مميزون</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">اختر من نخبة الفنانين</h2>
            </div>
            <Link
              href="/artists"
              className="hidden md:flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-[#D4AF37] transition"
            >
              عرض الكل
              <ChevronRight size={16} />
            </Link>
          </div>

          {featuredArtists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArtists.map((artist) => (
                <Link
                  key={artist.id}
                  href={`/artists/${artist.slug}`}
                  className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-[#111] to-[#333]">
                    {artist.coverImage ? (
                      <img
                        src={artist.coverImage}
                        alt={artist.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music size={64} className="text-[#D4AF37]/50" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                    <div className="absolute top-4 right-4">
                      <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-gray-900">
                        {artist.category || "فنان"}
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-2xl font-black text-white mb-2">{artist.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-white/80">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-[#D4AF37] fill-[#D4AF37]" />
                          <span>4.9</span>
                        </div>
                        <span>•</span>
                        <span>متاح للحجز</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">عرض الملف الشخصي</span>
                    <ArrowLeft size={18} className="text-[#D4AF37] group-hover:-translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl">
              <Music className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-gray-500 font-semibold mb-2">لا يوجد فنانين معتمدين بعد</p>
              <p className="text-sm text-gray-400">انضم كفنان وابدأ رحلتك معنا</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ خدماتنا ═══════════ */}
      <section id="services" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-xs font-bold mb-3">لماذا نحن؟</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">تجربة حجز استثنائية</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">نوفر لك أعلى معايير الجودة والاحترافية في كل خطوة</p>
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
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#111] to-[#333] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon size={32} className="text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ من نحن ═══════════ */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-xs font-bold mb-3">من نحن</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">شريكك في نجاح فعالياتك</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                نحن منصة رائدة في مجال حجز الفنانين والموسيقيين للفعاليات والمناسبات.
                نجمع بين أفضل المواهب الفنية في مكان واحد، لنوفر لك تجربة حجز سلسة واحترافية.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
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
              <div className="bg-gradient-to-br from-[#111] to-[#333] rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#F4E5B8] flex items-center justify-center">
                      <span className="text-[#111] text-3xl font-black">N</span>
                    </div>
                    <div>
                      <p className="text-xl font-black text-gray-900">Nooryi Studio</p>
                      <p className="text-sm text-gray-500">منصة حجز الفنانين</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: "سنوات الخبرة", value: "+5" },
                      { label: "الفنانين المعتمدين", value: "+150" },
                      { label: "الفعاليات الناجحة", value: "+500" },
                      { label: "رضا العملاء", value: "98%" },
                    ].map((stat, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="text-gray-600 font-semibold">{stat.label}</span>
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
      <section className="py-20 bg-gradient-to-br from-[#111] to-[#333]">
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
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white rounded-2xl font-black text-lg hover:bg-white/20 transition-all"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ تواصل معنا ═══════════ */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-xs font-bold mb-3">تواصل معنا</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              نحن هنا <span className="text-[#D4AF37]">لمساعدتك</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 text-center shadow-lg border-2 border-transparent hover:border-[#D4AF37] transition">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#111] flex items-center justify-center mb-4">
                <Phone size={28} className="text-[#D4AF37]" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">اتصل بنا</h3>
              <p className="text-gray-600" dir="ltr">+20 100 000 0000</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 text-center shadow-lg border-2 border-transparent hover:border-[#D4AF37] transition">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#F4E5B8] flex items-center justify-center mb-4">
                <Mail size={28} className="text-[#111]" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">راسلنا</h3>
              <p className="text-gray-600" dir="ltr">info@noorystudio.com</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 text-center shadow-lg border-2 border-transparent hover:border-[#D4AF37] transition">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#111] flex items-center justify-center mb-4">
                <MapPin size={28} className="text-[#D4AF37]" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">موقعنا</h3>
              <p className="text-gray-600">القاهرة، مصر</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ التذييل ═══════════ */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#111] to-[#333] flex items-center justify-center">
                  <span className="text-[#D4AF37] text-2xl font-black">N</span>
                </div>
                <div>
                  <p className="text-xl font-black text-gray-900">Nooryi</p>
                  <p className="text-xs text-gray-500 font-bold tracking-[0.2em] uppercase">Studio</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed max-w-md">
                منصة احترافية لحجز أفضل الفنانين والموسيقيين للفعاليات والمناسبات.
                نوفر لك تجربة حجز سلسة وآمنة بأعلى معايير الجودة.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-black text-gray-900 mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-gray-600 hover:text-[#D4AF37] transition">الرئيسية</Link></li>
                <li><Link href="/artists" className="text-gray-600 hover:text-[#D4AF37] transition">الفنانين</Link></li>
                <li><Link href="/#about" className="text-gray-600 hover:text-[#D4AF37] transition">من نحن</Link></li>
                <li><Link href="/#services" className="text-gray-600 hover:text-[#D4AF37] transition">خدماتنا</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-black text-gray-900 mb-4">حسابك</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="text-gray-600 hover:text-[#D4AF37] transition">تسجيل الدخول</Link></li>
                <li><Link href="/register" className="text-gray-600 hover:text-[#D4AF37] transition">إنشاء حساب</Link></li>
                <li><Link href="/my-bookings" className="text-gray-600 hover:text-[#D4AF37] transition">حجوزاتي</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">© 2026 Nooryi Studio. جميع الحقوق محفوظة.</p>
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