import Link from "next/link"
import { Music, Calendar, ShieldCheck, Star, ArrowLeft, PlayCircle, CheckCircle2, Sparkles, Users, Headphones } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200">
      
      {/* ═══════════════════════════════════════════
          1. Navbar - الروابط متصلة بصفحاتك الفعلية
      ═══════════════════════════════════════════ */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-400 to-yellow-600 p-2.5 rounded-xl shadow-lg shadow-amber-500/20">
                <Music className="text-black" size={22} />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Nooryi Studio</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="/artists" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">الفنانين</Link>
              <Link href="/about" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">عن المنصة</Link>
              <Link href="/faq" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">الأسئلة الشائعة</Link>
              <Link href="/contact" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">تواصل معنا</Link>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors hidden sm:block px-4 py-2">
                تسجيل الدخول
              </Link>
              <Link 
                href="/register" 
                className="bg-white text-black text-sm font-bold px-5 py-2.5 rounded-full hover:bg-neutral-200 transition-all duration-300 shadow-lg shadow-white/5"
              >
                حساب جديد
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
          2. Hero Section
      ═══════════════════════════════════════════ */}
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        
        <div className="absolute top-20 -right-40 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px] -z-10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-amber-500/5 border border-amber-500/20 rounded-full px-4 py-1.5 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="text-xs font-semibold text-amber-200 tracking-wide">منصة حجز الفنانين المحترفين</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-8">
                اصنع مناسبة
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-600">
                    لا تُنسى
                  </span>
                </span>
              </h1>
              
              <p className="text-lg text-neutral-400 leading-relaxed mb-10 max-w-lg">
                منصة Nooryi Studio تجمع لك نخبة من الفنانين المحترفين. 
                اختر، احجز، واستمتع بتجربة حجز شفافة وآمنة.
              </p>

              {/* أزرار رئيسية متصلة بالصفحات الفعلية */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link 
                  href="/artists" 
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-xl shadow-amber-500/20"
                >
                  تصفح الفنانين
                  <ArrowLeft size={18} className="rotate-180" />
                </Link>
                <Link 
                  href="/register" 
                  className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium px-8 py-4 rounded-full transition-all duration-300 border border-white/10"
                >
                  <PlayCircle size={18} />
                  أنشئ حسابك مجاناً
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6 text-sm text-neutral-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-amber-500" size={16} />
                  <span>حجز فوري</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-amber-500" size={16} />
                  <span>دفع آمن</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-amber-500" size={16} />
                  <span>إلغاء مجاني</span>
                </div>
              </div>
            </div>

            {/* الصورة */}
            <div className="order-1 lg:order-2 relative">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-amber-900/20">
                <img 
                  src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=1200" 
                  alt="عازف موسيقي" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                <div className="absolute bottom-6 right-6 left-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex -space-x-2 space-x-reverse">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-gradient-to-br from-amber-400 to-amber-600" />
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="text-amber-400 fill-amber-400" size={14} />
                      <span className="text-sm font-bold text-white">4.9</span>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400">+2,400 عميل راضٍ عن خدماتنا</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          3. الميزات
      ═══════════════════════════════════════════ */}
      <section className="py-24 border-t border-white/5 bg-neutral-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">لماذا تختارنا؟</h2>
            <p className="text-neutral-400">نقدم لك تجربة حجز سلسة وموثوقة</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Users className="text-amber-400" size={28} />}
              title="فنانين محترفين"
              description="نخبة من أفضل الفنانين مع تقييمات حقيقية ومراجعات موثقة."
            />
            <FeatureCard 
              icon={<Calendar className="text-emerald-400" size={28} />}
              title="حجز فوري وآمن"
              description="اختر التاريخ والفترة المناسبة واحجز في دقائق معدودة."
            />
            <FeatureCard 
              icon={<Headphones className="text-blue-400" size={28} />}
              title="دعم فني متواصل"
              description="فريقنا متواجد على مدار الساعة لمساعدتك في أي استفسار."
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          4. Call to Action
      ═══════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/10 rounded-3xl p-12 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-500/10 blur-[100px]" />
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              جاهز لصناعة ذكرى لا تُنسى؟
            </h2>
            <p className="text-neutral-400 mb-8">
              انضم إلى آلاف العملاء الذين وثقوا بنا
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/artists"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105"
              >
                ابدأ الآن
              </Link>
              <Link 
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white/5 text-white font-medium px-8 py-4 rounded-full transition-all duration-300 border border-white/10"
              >
                تواصل معنا
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          5. Footer - كل الروابط متصلة بصفحاتك
      ═══════════════════════════════════════════ */}
      <footer className="border-t border-white/5 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-neutral-800 p-2 rounded-lg">
                  <Music className="text-amber-400" size={18} />
                </div>
                <span className="text-lg font-bold text-white">Nooryi Studio</span>
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed">
                منصة حجز الفنانين المحترفين الأولى في المنطقة.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">المنصة</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><Link href="/artists" className="hover:text-white transition-colors">الفنانين</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">عن المنصة</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">الأسئلة الشائعة</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">حسابي</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><Link href="/login" className="hover:text-white transition-colors">تسجيل الدخول</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">حساب جديد</Link></li>
                <li><Link href="/my-bookings" className="hover:text-white transition-colors">حجوزاتي</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">الدعم</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><Link href="/contact" className="hover:text-white transition-colors">تواصل معنا</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">مركز المساعدة</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-8 text-center">
            <p className="text-sm text-neutral-600">
              © {new Date().getFullYear()} Nooryi Studio. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-neutral-900/30 border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all duration-300">
      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 border border-white/5">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
      <p className="text-neutral-400 text-sm leading-relaxed">{description}</p>
    </div>
  )
}