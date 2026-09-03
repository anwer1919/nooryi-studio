import Link from "next/link"
import { 
  Music, Star, Users, Calendar, Shield, CreditCard, Zap,
  Award, CheckCircle2, Phone, Mail, MapPin, ArrowLeft
} from "lucide-react"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

async function getFeaturedArtists() {
  try {
    const artists = await prisma.artist.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 3,
    })
    return artists
  } catch {
    return []
  }
}

export default async function HomePage() {
  const featuredArtists = await getFeaturedArtists()

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* ═══════════ الترويسة - أبيض مع ليموني ═══════════ */}
      <header className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-[#FACC15]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FACC15] to-[#FDE047] flex items-center justify-center shadow-lg border-2 border-[#FACC15] group-hover:scale-110 transition-transform">
              <span className="text-gray-900 text-2xl font-black">N</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-wide">Nooryi</h1>
              <p className="text-xs text-gray-500 font-bold tracking-widest">STUDIO</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-[#FACC15] font-bold transition">الرئيسية</Link>
            <Link href="/artists" className="text-gray-700 hover:text-[#FACC15] font-bold transition">الفنانين</Link>
            <Link href="/#about" className="text-gray-700 hover:text-[#FACC15] font-bold transition">من نحن</Link>
            <Link href="/#services" className="text-gray-700 hover:text-[#FACC15] font-bold transition">خدماتنا</Link>
            <Link href="/#contact" className="text-gray-700 hover:text-[#FACC15] font-bold transition">تواصل معنا</Link>
          </nav>

          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-gray-700 border-2 border-gray-300 rounded-xl font-bold hover:border-[#FACC15] hover:text-[#FACC15] transition"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-[#FACC15] text-gray-900 rounded-xl font-bold hover:bg-[#FDE047] transition shadow-lg"
            >
              إنشاء حساب
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════ Hero - أبيض مع ليموني فاتح ═══════════ */}
      <section className="bg-gradient-to-br from-white via-[#FEFCE8] to-[#FEF9C3] py-24 px-4 relative overflow-hidden">
        {/* دوائر زخرفية ليمونية */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-[#FACC15]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#FDE047]/20 rounded-full blur-3xl"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#FACC15]/20 border border-[#FACC15]/40 rounded-full px-6 py-2 mb-6">
            <Star className="text-[#FACC15]" size={16} />
            <span className="text-gray-800 font-bold text-sm">منصة حجز الفنانين الأولى</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
            احجز أفضل <span className="text-[#FACC15]">الفنانين</span>
            <br />
            لفعالياتك <span className="text-[#FACC15]">المميزة</span>
          </h2>

          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            منصة احترافية تجمع بين أفضل الفنانين والموسيقيين في مكان واحد.
            احجز بسهولة، ادفع بأمان، واستمتع بتجربة لا تُنسى.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/artists"
              className="flex items-center gap-2 px-8 py-4 bg-[#FACC15] text-gray-900 rounded-xl font-black text-lg hover:bg-[#FDE047] transition shadow-2xl hover:scale-105"
            >
              <Music size={22} />
              تصفح الفنانين
              <ArrowLeft size={18} />
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-black text-lg hover:border-[#FACC15] hover:text-[#FACC15] transition"
            >
              ابدأ الآن مجاناً
            </Link>
          </div>

          {/* إحصائيات */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-6 border-2 border-[#FACC15]/30 shadow-lg">
              <p className="text-3xl md:text-4xl font-black text-[#FACC15]">+150</p>
              <p className="text-gray-600 mt-2 text-sm">فنان محترف</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border-2 border-[#FACC15]/30 shadow-lg">
              <p className="text-3xl md:text-4xl font-black text-[#FACC15]">+500</p>
              <p className="text-gray-600 mt-2 text-sm">فعالية ناجحة</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border-2 border-[#FACC15]/30 shadow-lg">
              <p className="text-3xl md:text-4xl font-black text-[#FACC15]">4.9★</p>
              <p className="text-gray-600 mt-2 text-sm">تقييم العملاء</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ نبذة عنا - أبيض نظيف ═══════════ */}
      <section id="about" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-[#FACC15]/20 text-gray-800 rounded-full text-sm font-bold mb-4">
              نبذة عنا
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              من <span className="text-[#FACC15]">نحن؟</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">
                Nooryi Studio - شريكك في نجاح فعالياتك
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                نحن منصة رائدة في مجال حجز الفنانين والموسيقيين للفعاليات والمناسبات.
                نجمع بين أفضل المواهب الفنية في مكان واحد، لنوفر لك تجربة حجز سلسة واحترافية.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                سواء كنت تبحث عن فرقة موسيقية لحفل زفاف، أو مغني لفعالية خاصة،
                أو حتى منسق أغاني لحفلة تخرج، تجد لدينا كل ما تحتاجه بأعلى معايير الجودة والاحترافية.
              </p>

              <div className="space-y-3">
                {[
                  "أكثر من 150 فنان محترف معتمد",
                  "نظام دفع آمن ومشفر 100%",
                  "دعم فني على مدار الساعة",
                  "ضمان استرداد كامل في حالة الإلغاء",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#FACC15] flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={14} className="text-gray-900" />
                    </div>
                    <span className="text-gray-700 font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-[#FEF9C3] to-[#FEF08A] rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FACC15] to-[#FDE047] flex items-center justify-center">
                      <span className="text-gray-900 text-3xl font-black">N</span>
                    </div>
                    <div>
                      <p className="text-xl font-black text-gray-900">Nooryi Studio</p>
                      <p className="text-sm text-gray-500">منصة حجز الفنانين</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: "سنوات الخبرة", value: "+5" },
                      { label: "الفنانين المعتمدين", value: "+150" },
                      { label: "الفعاليات الناجحة", value: "+500" },
                      { label: "رضا العملاء", value: "98%" },
                    ].map((stat, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#FEFCE8] rounded-xl">
                        <span className="text-gray-600 font-semibold">{stat.label}</span>
                        <span className="text-[#FACC15] font-black text-xl">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#FACC15]/20 rounded-full blur-xl"></div>
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#FDE047]/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ لماذا تختارنا - أبيض مع ليموني ═══════════ */}
      <section id="services" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-[#FEFCE8]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-[#FACC15]/20 text-gray-800 rounded-full text-sm font-bold mb-4">
              خدماتنا
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              لماذا تختار <span className="text-[#FACC15]">Nooryi؟</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              نوفر لك تجربة حجز استثنائية بأعلى معايير الجودة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "فنانين معتمدين",
                desc: "جميع الفنانين يخضعون لعملية تحقق صارمة لضمان أعلى مستوى من الاحترافية",
                bgColor: "from-[#FACC15] to-[#FDE047]",
                iconColor: "text-gray-900",
              },
              {
                icon: CreditCard,
                title: "دفع آمن 100%",
                desc: "نظام دفع مشفر وآمن مع ضمان استرداد كامل في حالة الإلغاء",
                bgColor: "from-gray-800 to-gray-900",
                iconColor: "text-[#FACC15]",
              },
              {
                icon: Zap,
                title: "حجز سهل وسريع",
                desc: "احجز فنانك المفضل في دقائق مع تأكيد فوري ومتابعة مستمرة",
                bgColor: "from-[#FDE047] to-[#FEF08A]",
                iconColor: "text-gray-900",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-transparent hover:border-[#FACC15]"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.bgColor} flex items-center justify-center mb-6 shadow-lg`}>
                  <feature.icon size={32} className={feature.iconColor} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ فنانون مميزون ═══════════ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-[#FACC15]/20 text-gray-800 rounded-full text-sm font-bold mb-4">
              مواهبنا
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              فنانون <span className="text-[#FACC15]">مميزون</span>
            </h2>
            <p className="text-gray-600">اختر من بين نخبة من أفضل الفنانين</p>
          </div>

          {featuredArtists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredArtists.map((artist) => (
                <Link
                  key={artist.id}
                  href={`/artists/${artist.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-transparent hover:border-[#FACC15]"
                >
                  <div className="relative h-56 bg-gradient-to-br from-[#FEF9C3] to-[#FEF08A] overflow-hidden">
                    {artist.coverImage ? (
                      <img
                        src={artist.coverImage}
                        alt={artist.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music size={64} className="text-[#FACC15]/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-4 right-4 left-4">
                      <h3 className="text-white font-black text-xl">{artist.name}</h3>
                      <p className="text-[#FACC15] text-sm font-bold">{artist.category}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">عرض الملف</span>
                      <ArrowLeft size={18} className="text-[#FACC15] group-hover:-translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <Music className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500">لا يوجد فنانين معتمدين بعد</p>
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              href="/artists"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#FACC15] text-gray-900 rounded-xl font-bold hover:bg-[#FDE047] transition shadow-lg"
            >
              عرض الكل
              <ArrowLeft size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA - ليموني فاتح ═══════════ */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#FACC15] via-[#FDE047] to-[#FEF08A]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">
            جاهز لبدء رحلتك؟
          </h2>
          <p className="text-lg text-gray-700 mb-10 max-w-2xl mx-auto">
            انضم إلى آلاف العملاء الذين يثقون بنا في تنظيم فعاليات لا تُنسى
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/register"
              className="px-8 py-4 bg-gray-900 text-[#FACC15] rounded-xl font-black text-lg hover:bg-gray-800 transition shadow-2xl"
            >
              إنشاء حساب مجاني
            </Link>
            <Link
              href="/#contact"
              className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-900 rounded-xl font-black text-lg hover:bg-gray-100 transition"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ تواصل معنا ═══════════ */}
      <section id="contact" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-[#FACC15]/20 text-gray-800 rounded-full text-sm font-bold mb-4">
              تواصل معنا
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              نحن هنا <span className="text-[#FACC15]">لمساعدتك</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 text-center shadow-lg border-2 border-transparent hover:border-[#FACC15] transition">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FACC15] flex items-center justify-center mb-4">
                <Phone size={28} className="text-gray-900" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">اتصل بنا</h3>
              <p className="text-gray-600" dir="ltr">+20 100 000 0000</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 text-center shadow-lg border-2 border-transparent hover:border-[#FACC15] transition">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-900 flex items-center justify-center mb-4">
                <Mail size={28} className="text-[#FACC15]" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">راسلنا</h3>
              <p className="text-gray-600" dir="ltr">info@noorystudio.com</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 text-center shadow-lg border-2 border-transparent hover:border-[#FACC15] transition">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FDE047] flex items-center justify-center mb-4">
                <MapPin size={28} className="text-gray-900" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">موقعنا</h3>
              <p className="text-gray-600">القاهرة، مصر</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ التذييل - أسود مع ليموني ═══════════ */}
      <footer className="bg-gradient-to-l from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="h-1 bg-gradient-to-l from-[#FACC15] via-[#FDE047] to-[#FACC15]"></div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FACC15] to-[#FDE047] flex items-center justify-center">
                  <span className="text-gray-900 text-2xl font-black">N</span>
                </div>
                <div>
                  <p className="text-xl font-black text-[#FACC15]">Nooryi</p>
                  <p className="text-xs text-gray-400 tracking-widest">STUDIO</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                منصة احترافية لحجز أفضل الفنانين والموسيقيين للفعاليات والمناسبات.
                نوفر لك تجربة حجز سلسة وآمنة بأعلى معايير الجودة.
              </p>
            </div>

            <div>
              <h4 className="text-[#FACC15] font-black mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-gray-400 hover:text-[#FACC15] transition">الرئيسية</Link></li>
                <li><Link href="/artists" className="text-gray-400 hover:text-[#FACC15] transition">الفنانين</Link></li>
                <li><Link href="/#about" className="text-gray-400 hover:text-[#FACC15] transition">من نحن</Link></li>
                <li><Link href="/#services" className="text-gray-400 hover:text-[#FACC15] transition">خدماتنا</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#FACC15] font-black mb-4">حسابك</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="text-gray-400 hover:text-[#FACC15] transition">تسجيل الدخول</Link></li>
                <li><Link href="/register" className="text-gray-400 hover:text-[#FACC15] transition">إنشاء حساب</Link></li>
                <li><Link href="/my-bookings" className="text-gray-400 hover:text-[#FACC15] transition">حجوزاتي</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 Nooryi Studio. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-2 text-[#FACC15]">
              <Award size={16} />
              <span className="text-xs font-bold">منصة معتمدة رسمياً</span>
            </div>
          </div>
        </div>

        <div className="h-1 bg-gradient-to-l from-[#FACC15] via-[#FDE047] to-[#FACC15]"></div>
      </footer>
    </div>
  )
}