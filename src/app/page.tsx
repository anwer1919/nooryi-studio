import Link from "next/link"
import { Music, Star, Shield, CreditCard, Zap, Award, CheckCircle2, Phone, Mail, MapPin, ArrowLeft, Mic, Sparkles, ChevronRight, Menu } from "lucide-react"
import { prisma } from "@/lib/prisma"
import ArtistCarousel from "@/components/ArtistCarousel"
import SocialLinks from "@/components/SocialLinks"
import ThemeToggle from "@/components/ThemeToggle"

export const dynamic = "force-dynamic"

function getDemoArtists() {
  return [
    { id: "demo-1", name: "أحمد الشريف", slug: "ahmed-alsharif", category: "مطرب", bio: "صوت شرقي أصيل يأسر القلوب — خبرة 15 عاماً في حفلات الزفاف والمناسبات", profileImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600", coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200", rating: 4.9, reviewsCount: 47, bookingsCount: 128 },
    { id: "demo-2", name: "فرقة النيل", slug: "nile-ensemble", category: "فرقة موسيقية", bio: "فرقة موسيقية متكاملة تقدم أجمل الألحان العربية والغربية بأسلوب عصري", profileImage: "https://images.unsplash.com/photo-1511650119689-90c1a9f5d4a2?w=600", coverImage: "https://images.unsplash.com/photo-1511650119689-90c1a9f5d4a2?w=1200", rating: 4.8, reviewsCount: 35, bookingsCount: 89 },
    { id: "demo-3", name: "دي جي رامي", slug: "dj-rami", category: "دي جي", bio: "خلطات موسيقية تبقي الطاقة عالية حتى آخر الليلة", profileImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600", coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200", rating: 4.7, reviewsCount: 62, bookingsCount: 215 },
    { id: "demo-4", name: "سارة محمود", slug: "sara-mahmoud", category: "مطربة", bio: "صوت ملائكي يجمع بين الطرب الأصيل والأغاني العصرية", profileImage: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600", coverImage: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200", rating: 5.0, reviewsCount: 28, bookingsCount: 76 },
  ]
}

async function getFeaturedArtists() {
  try {
    const artists = await prisma.artist.findMany({ where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" }, take: 8, include: { _count: { select: { bookings: true, reviews: true } }, reviews: { select: { rating: true } } } })
    if (artists.length > 0) {
      return artists.map((artist: any) => {
        const ratings = artist.reviews?.map((r: any) => r.rating) || []
        const avgRating = ratings.length > 0 ? ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length : 5.0
        return { id: artist.id, name: artist.name, slug: artist.slug, category: artist.category, bio: artist.bio, profileImage: artist.profileImage, coverImage: artist.coverImage, rating: parseFloat(avgRating.toFixed(1)), reviewsCount: artist._count.reviews, bookingsCount: artist._count.bookings }
      })
    }
    return getDemoArtists()
  } catch { return getDemoArtists() }
}

async function getSiteSettings() {
  try {
    const settings = await prisma.siteSetting.findUnique({ where: { id: "site_settings" } })
    return settings || { siteName: "Nooryi", tagline: "منصة حجز الفنانين الأولى", email: "info@noorystudio.com", phone: "+20 100 000 0000", address: "القاهرة، مصر" }
  } catch { return { siteName: "Nooryi", tagline: "منصة حجز الفنانين الأولى", email: "info@noorystudio.com", phone: "+20 100 000 0000", address: "القاهرة، مصر" } }
}

export default async function HomePage() {
  const featuredArtists = await getFeaturedArtists()
  const siteSettings = await getSiteSettings()

  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-x-hidden" dir="rtl">

      {/* ═══ Header ═══ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-[#F5A623]/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center shadow-lg shadow-[#F5A623]/20">
                <span className="text-[#0a0a0a] text-xl md:text-2xl font-black">N</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl font-black text-white">{siteSettings.siteName}</h1>
                <p className="text-[9px] text-[#F5A623] font-bold tracking-[0.2em] uppercase">{siteSettings.siteName.split(" ")[1] || "Studio"}</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-semibold text-white hover:text-[#F5A623] transition">الرئيسية</Link>
              <Link href="/artists" className="text-sm font-semibold text-gray-400 hover:text-[#F5A623] transition">الفنانين</Link>
              <Link href="/#about" className="text-sm font-semibold text-gray-400 hover:text-[#F5A623] transition">من نحن</Link>
              <Link href="/#services" className="text-sm font-semibold text-gray-400 hover:text-[#F5A623] transition">خدماتنا</Link>
              <Link href="/#contact" className="text-sm font-semibold text-gray-400 hover:text-[#F5A623] transition">تواصل معنا</Link>
            </nav>
            <div className="flex items-center gap-2 md:gap-3">
              <ThemeToggle />
              <Link href="/login" className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-bold text-white border border-[#F5A623]/30 rounded-xl hover:border-[#F5A623] hover:text-[#F5A623] transition">دخول</Link>
              <Link href="/register" className="px-4 md:px-5 py-2 md:py-2.5 bg-gradient-to-r from-[#F5A623] to-[#E8961A] text-[#0a0a0a] text-sm font-black rounded-xl hover:shadow-lg hover:shadow-[#F5A623]/30 transition-all flex items-center gap-1.5"><Sparkles size={14} /><span className="hidden sm:inline">إنشاء حساب</span><span className="sm:hidden">حساب</span></Link>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ Hero + Carousel ═══ */}
      <section className="relative pt-24 md:pt-28 pb-12 md:pb-20 bg-gradient-to-b from-[#0a0a0a] via-[#111] to-[#0a0a0a] overflow-hidden">
        {/* خلفية */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-[10%] w-2 h-2 bg-[#F5A623]/40 rounded-full animate-float-up"></div>
          <div className="absolute top-40 left-[15%] w-3 h-3 bg-[#F5A623]/30 rounded-full animate-float-down"></div>
          <div className="absolute bottom-20 right-[20%] w-2 h-2 bg-[#FFC966]/30 rounded-full animate-float-up-delay"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 lg:px-8">
          {/* اللوجو + الميكروفون */}
          <div className="flex items-center justify-center gap-5 mb-5 mt-4 md:mt-8">
            <div className="relative animate-float-up">
              <div className="absolute inset-0 bg-gradient-to-br from-[#F5A623] to-[#FFC966] rounded-2xl blur-lg opacity-60"></div>
              <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-[#111] to-[#1a1a1a] border border-[#F5A623]/40 flex items-center justify-center shadow-2xl">
                <span className="text-[#F5A623] text-2xl md:text-3xl font-black">N</span>
              </div>
            </div>
            <div className="w-px h-12 md:h-16 bg-gradient-to-b from-transparent via-[#F5A623] to-transparent"></div>
            <div className="relative animate-mic-bounce">
              <div className="absolute inset-0 bg-[#F5A623]/30 rounded-full blur-xl animate-pulse-gold"></div>
              <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center shadow-2xl shadow-[#F5A623]/40 border-2 border-[#FFC966]/50">
                <Mic size={24} className="text-[#0a0a0a] md:hidden" strokeWidth={2.5} /><Mic size={28} className="text-[#0a0a0a] hidden md:block" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* العنوان */}
          <h2 className="text-center text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 md:mb-6 leading-tight px-2">
            اختر من{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[#F5A623] via-[#FFC966] to-[#F5A623] bg-clip-text text-transparent">نخبة الفنانين</span>
              <svg className="absolute -bottom-1 md:-bottom-2 left-0 w-full" height="10" viewBox="0 0 300 12" fill="none"><path d="M2 8C75 2 225 2 298 8" stroke="#F5A623" strokeWidth="3" strokeLinecap="round"/></svg>
            </span>
          </h2>
          <p className="text-center text-base md:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-4 md:mb-6 px-4">
            تصفح أفضل الفنانين المعتمدين واحجز من يناسب فعاليتك —
            <span className="text-[#F5A623] font-semibold"> تجربة لا تُنسى</span>
          </p>
          <div className="flex items-center justify-center gap-3 mb-8 md:mb-12">
            <div className="h-px w-16 md:w-20 bg-gradient-to-r from-transparent to-[#F5A623]"></div>
            <Music size={16} className="text-[#F5A623] animate-float-up" />
            <div className="h-px w-16 md:w-20 bg-gradient-to-l from-transparent to-[#F5A623]"></div>
          </div>

          {/* Carousel */}
          {(featuredArtists?.length || 0) > 0 ? (
            <ArtistCarousel artists={featuredArtists || []} />
          ) : (
            <div className="text-center py-16"><Music className="mx-auto text-[#F5A623]/30 mb-4" size={64} /><h3 className="text-2xl font-black text-white mb-2">لا يوجد فنانين بعد</h3></div>
          )}

          <div className="text-center mt-8 md:mt-12">
            <Link href="/artists" className="inline-flex items-center gap-2 px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-[#F5A623] to-[#E8961A] text-[#0a0a0a] font-black rounded-2xl hover:shadow-2xl hover:shadow-[#F5A623]/40 hover:scale-105 transition-all duration-300 text-base md:text-lg">
              عرض جميع الفنانين <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ خدماتنا ═══ */}
      <section id="services" className="py-16 md:py-20 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <span className="inline-block px-3 py-1 bg-[#F5A623]/10 text-[#F5A623] rounded-full text-xs font-bold mb-3">لماذا نحن؟</span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-4">تجربة حجز استثنائية</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">نوفر لك أعلى معايير الجودة والاحترافية في كل خطوة</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: Shield, title: "فنانين معتمدين", desc: "جميع الفنانين يخضعون لعملية تحقق صارمة لضمان أعلى مستوى من الاحترافية" },
              { icon: CreditCard, title: "دفع آمن 100%", desc: "نظام دفع مشفر وآمن مع ضمان استرداد كامل في حالة الإلغاء" },
              { icon: Zap, title: "حجز سهل وسريع", desc: "احجز فنانك المفضل في دقائق مع تأكيد فوري ومتابعة مستمرة" },
            ].map((f, i) => (
              <div key={i} className="group bg-[#0a0a0a] rounded-2xl md:rounded-3xl p-6 md:p-8 border border-[#F5A623]/10 hover:border-[#F5A623]/30 transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-[#111] border border-[#F5A623]/20 flex items-center justify-center mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                  <f.icon size={28} className="text-[#F5A623]" />
                </div>
                <h3 className="text-lg md:text-xl font-black text-white mb-2 md:mb-3">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm md:text-base">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ من نحن ═══ */}
      <section id="about" className="py-16 md:py-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <span className="inline-block px-3 py-1 bg-[#F5A623]/10 text-[#F5A623] rounded-full text-xs font-bold mb-3">من نحن</span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-4 md:mb-6">شريكك في نجاح فعالياتك</h2>
              <p className="text-gray-400 leading-relaxed mb-4 md:mb-6 text-sm md:text-base">نحن منصة رائدة في مجال حجز الفنانين والموسيقيين للفعاليات والمناسبات. نجمع بين أفضل المواهب الفنية في مكان واحد.</p>
              <p className="text-gray-400 leading-relaxed mb-6 md:mb-8 text-sm md:text-base">سواء كنت تبحث عن فرقة موسيقية لحفل زفاف، أو مغني لفعالية خاصة، أو منسق أغاني — تجد لدينا كل ما تحتاجه.</p>
              <div className="space-y-3">
                {["أكثر من 150 فنان محترف معتمد", "نظام دفع آمن ومشفر 100%", "دعم فني على مدار الساعة", "ضمان استرداد كامل في حالة الإلغاء"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-[#F5A623] to-[#FFC966] flex items-center justify-center flex-shrink-0"><CheckCircle2 size={12} className="text-[#0a0a0a]" /></div>
                    <span className="text-gray-300 font-semibold text-sm md:text-base">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-[#111] rounded-2xl md:rounded-3xl p-6 md:p-8 border border-[#F5A623]/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#FFC966] flex items-center justify-center"><span className="text-[#0a0a0a] text-2xl md:text-3xl font-black">N</span></div>
                  <div><p className="text-lg md:text-xl font-black text-white">{siteSettings.siteName}</p><p className="text-sm text-gray-400">{siteSettings.tagline}</p></div>
                </div>
                <div className="space-y-3">
                  {[{ label: "سنوات الخبرة", value: "+5" }, { label: "الفنانين المعتمدين", value: "+150" }, { label: "الفعاليات الناجحة", value: "+500" }, { label: "رضا العملاء", value: "98%" }].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between p-3 md:p-4 bg-[#0a0a0a] rounded-xl border border-[#F5A623]/5">
                      <span className="text-gray-400 font-semibold text-sm md:text-base">{stat.label}</span>
                      <span className="text-xl md:text-2xl font-black text-[#F5A623]">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-[#111] to-[#1a1a1a]">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-black text-white mb-4 md:mb-6">جاهز لبدء <span className="text-[#F5A623]">رحلتك؟</span></h2>
          <p className="text-base md:text-lg text-gray-400 mb-8 md:mb-10 max-w-2xl mx-auto">انضم إلى آلاف العملاء الذين يثقون بنا في تنظيم فعاليات لا تُنسى</p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-[#F5A623] to-[#FFC966] text-[#0a0a0a] rounded-2xl font-black text-base md:text-lg hover:shadow-2xl hover:shadow-[#F5A623]/30 hover:scale-105 transition-all"><Sparkles size={18} /> إنشاء حساب مجاني</Link>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-[#0a0a0a] border-2 border-[#F5A623]/30 text-white rounded-2xl font-black text-base md:text-lg hover:border-[#F5A623] transition-all">تسجيل الدخول</Link>
          </div>
        </div>
      </section>

      {/* ═══ تواصل معنا ═══ */}
      <section id="contact" className="py-16 md:py-20 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-10 md:mb-12">
            <span className="inline-block px-3 py-1 bg-[#F5A623]/10 text-[#F5A623] rounded-full text-xs font-bold mb-3">تواصل معنا</span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-4">نحن هنا <span className="text-[#F5A623]">لمساعدتك</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: Phone, title: "اتصل بنا", value: siteSettings.phone, ltr: true, bg: "bg-[#111]" },
              { icon: Mail, title: "راسلنا", value: siteSettings.email, ltr: true, bg: "bg-gradient-to-br from-[#F5A623] to-[#E8961A]", iconDark: true },
              { icon: MapPin, title: "موقعنا", value: siteSettings.address, ltr: false, bg: "bg-[#111]" },
            ].map((c, i) => (
              <div key={i} className="bg-[#111] rounded-2xl p-6 md:p-8 text-center border border-[#F5A623]/10 hover:border-[#F5A623]/30 transition">
                <div className={`w-14 h-14 md:w-16 md:h-16 mx-auto rounded-xl md:rounded-2xl ${c.bg} flex items-center justify-center mb-4`}><c.icon size={24} className={c.iconDark ? "text-[#0a0a0a]" : "text-[#F5A623]"} /></div>
                <h3 className="text-base md:text-lg font-black text-white mb-2">{c.title}</h3>
                <p className="text-gray-400 text-sm md:text-base" dir={c.ltr ? "ltr" : "rtl"}>{c.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Footer ══ */}
      <footer className="bg-[#111] border-t border-[#F5A623]/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center"><span className="text-[#0a0a0a] text-xl md:text-2xl font-black">N</span></div>
                <div><p className="text-lg md:text-xl font-black text-white">Nooryi</p><p className="text-[9px] text-[#F5A623] font-bold tracking-[0.2em] uppercase">{siteSettings.siteName.split(" ")[1] || "Studio"}</p></div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">منصة احترافية لحجز أفضل الفنانين والموسيقيين للفعاليات والمناسبات.</p>
            </div>
            <div>
              <h4 className="text-sm font-black text-white mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-gray-400 hover:text-[#F5A623] transition">الرئيسية</Link></li>
                <li><Link href="/artists" className="text-gray-400 hover:text-[#F5A623] transition">الفنانين</Link></li>
                <li><Link href="/#about" className="text-gray-400 hover:text-[#F5A623] transition">من نحن</Link></li>
                <li><Link href="/#services" className="text-gray-400 hover:text-[#F5A623] transition">خدماتنا</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-black text-white mb-4">حسابك</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="text-gray-400 hover:text-[#F5A623] transition">تسجيل الدخول</Link></li>
                <li><Link href="/register" className="text-gray-400 hover:text-[#F5A623] transition">إنشاء حساب</Link></li>
                <li><Link href="/my-bookings" className="text-gray-400 hover:text-[#F5A623] transition">حجوزاتي</Link></li>
              </ul>
            </div>
          </div>
          <SocialLinks />
          <div className="pt-6 md:pt-8 border-t border-[#F5A623]/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">© 2026 {siteSettings.siteName}. جميع الحقوق محفوظة.</p>
            <div className="flex items-center gap-2 text-[#F5A623]"><Award size={14} /><span className="text-xs font-bold">منصة معتمدة رسمياً</span></div>
          </div>
        </div>
      </footer>
    </div>
  )
}