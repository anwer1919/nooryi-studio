import Link from "next/link"
import { 
  Music, 
  Calendar, 
  Shield, 
  Star, 
  ArrowLeft, 
  Sparkles, 
  Users, 
  Award,
  Zap,
  Play,
  CheckCircle2
} from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-yellow-500/5 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[120px] animate-pulse-slow" />
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-br from-yellow-400 to-amber-600 p-2.5 rounded-2xl">
                  <Music className="text-black" size={24} />
                </div>
              </div>
              <span className="text-2xl font-black tracking-tight">Nooryi</span>
            </Link>
            
            <div className="hidden lg:flex items-center gap-1">
              <Link
                href="/artists"
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all"
              >
                الفنانين
              </Link>
              <Link
                href="/about"
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all"
              >
                عن المنصة
              </Link>
              <Link
                href="/faq"
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all"
              >
                الأسئلة الشائعة
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all"
              >
                تواصل معنا
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="hidden sm:block text-sm font-semibold text-white/80 hover:text-white transition-colors"
              >
                تسجيل الدخول
              </Link>
              <Link 
                href="/register" 
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-xl opacity-75 group-hover:opacity-100 blur transition-all" />
                <div className="relative bg-black px-6 py-2.5 rounded-xl text-sm font-bold text-white">
                  ابدأ الآن
                </div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                </span>
                <span className="text-xs font-semibold text-white/90">منصة معتمدة لحجز المواهب الفنية</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight">
                  اصنع مناسبات
                  <br />
                  <span className="relative inline-block">
                    <span className="gradient-text">استثنائية</span>
                    <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                      <path d="M2 9C50 3 150 3 198 9" stroke="url(#underline)" strokeWidth="3" strokeLinecap="round"/>
                      <defs>
                        <linearGradient id="underline" x1="0" y1="0" x2="200" y2="0">
                          <stop stopColor="#FCD34D"/>
                          <stop offset="1" stopColor="#D97706"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                </h1>
                
                <p className="text-lg md:text-xl text-white/60 leading-relaxed max-w-lg">
                  منصة Nooryi تجمع لك نخبة من أفضل الفنانين والموسيقيين المحترفين. 
                  احجز بكل سهولة وشفافية مع ضمان حماية كامل لحقوقك.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/artists" 
                  className="group relative inline-flex items-center justify-center gap-2"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-2xl opacity-75 group-hover:opacity-100 blur transition-all" />
                  <div className="relative bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold px-8 py-4 rounded-2xl transition-all group-hover:scale-105">
                    <span className="flex items-center gap-2">
                      تصفح الفنانين
                      <ArrowLeft size={18} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
                
                <Link 
                  href="/register" 
                  className="group glass hover:bg-white/10 font-semibold px-8 py-4 rounded-2xl transition-all"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Play size={18} />
                    شاهد كيف نعمل
                  </span>
                </Link>
              </div>

              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <CheckCircle2 className="text-yellow-500" size={16} />
                  <span>حجز فوري</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <CheckCircle2 className="text-yellow-500" size={16} />
                  <span>دفع آمن 100%</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <CheckCircle2 className="text-yellow-500" size={16} />
                  <span>إلغاء مجاني</span>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="relative">
                {/* Main Image */}
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=1200" 
                    alt="Artist" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  
                  {/* Floating Card */}
                  <div className="absolute bottom-6 right-6 left-6 glass rounded-2xl p-6 animate-float">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex -space-x-3 space-x-reverse">
                        <div className="w-10 h-10 rounded-full border-2 border-black bg-gradient-to-br from-yellow-400 to-amber-600" />
                        <div className="w-10 h-10 rounded-full border-2 border-black bg-gradient-to-br from-yellow-400 to-amber-600" />
                        <div className="w-10 h-10 rounded-full border-2 border-black bg-gradient-to-br from-yellow-400 to-amber-600" />
                        <div className="w-10 h-10 rounded-full border-2 border-black bg-gradient-to-br from-yellow-400 to-amber-600" />
                      </div>
                      <div className="flex items-center gap-1 glass px-3 py-1.5 rounded-full">
                        <Star className="text-yellow-400 fill-yellow-400" size={14} />
                        <span className="text-sm font-bold">4.9</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">+2,400 عميل راضٍ</p>
                      <p className="text-sm font-semibold">تقييمات موثقة ومعتمدة</p>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -left-8 top-12 glass rounded-2xl p-4 shadow-xl animate-float-delayed hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center">
                      <Calendar className="text-black" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-white/60">الحجز القادم</p>
                      <p className="text-sm font-bold">فرقة الطرب • السبت</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-4 -top-4 glass rounded-2xl p-4 shadow-xl animate-float hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <Shield className="text-green-400" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-white/60">حماية الدفع</p>
                      <p className="text-sm font-bold text-green-400">مضمون 100%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 mb-2">
                <Users className="text-yellow-500" size={24} />
              </div>
              <p className="text-4xl md:text-5xl font-black gradient-text">+500</p>
              <p className="text-sm text-white/60">فنان محترف</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 mb-2">
                <Award className="text-yellow-500" size={24} />
              </div>
              <p className="text-4xl md:text-5xl font-black gradient-text">+2,400</p>
              <p className="text-sm text-white/60">حجز ناجح</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 mb-2">
                <Star className="text-yellow-500" size={24} />
              </div>
              <p className="text-4xl md:text-5xl font-black gradient-text">4.9</p>
              <p className="text-sm text-white/60">متوسط التقييم</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 mb-2">
                <Zap className="text-yellow-500" size={24} />
              </div>
              <p className="text-4xl md:text-5xl font-black gradient-text">24/7</p>
              <p className="text-sm text-white/60">دعم فني</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2">
              <Sparkles className="text-yellow-400" size={14} />
              <span className="text-xs font-semibold text-white/80">لماذا Nooryi؟</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black">
              تجربة حجز <span className="gradient-text">لا مثيل لها</span>
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              صممنا كل تفصيلة في المنصة لتضمن لك أفضل تجربة ممكنة
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 - Yellow */}
            <div className="group relative glass rounded-3xl p-8 hover:bg-white/[0.08] transition-all duration-500 hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Music className="text-yellow-400" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">مواهب مُعتمدة</h3>
              <p className="text-white/60 leading-relaxed">نختار فنانيك بعناية فائقة، مع ملفات تعريفية شاملة وتقييمات حقيقية.</p>
            </div>

            {/* Card 2 - Green */}
            <div className="group relative glass rounded-3xl p-8 hover:bg-white/[0.08] transition-all duration-500 hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="text-green-400" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">حجز آمن ومضمون</h3>
              <p className="text-white/60 leading-relaxed">نظام دفع محمي يضمن حقك وحق الفنان، مع تتبع حالة الحجز.</p>
            </div>

            {/* Card 3 - Blue */}
            <div className="group relative glass rounded-3xl p-8 hover:bg-white/[0.08] transition-all duration-500 hover:-translate-y-2">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="text-blue-400" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">شفافية كاملة</h3>
              <p className="text-white/60 leading-relaxed">لا رسوم مخفية. اعرف التكلفة الإجمالية قبل تأكيد الحجز.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl glass p-12 md:p-16">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-amber-600/10" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/20 rounded-full blur-[120px]" />
            
            <div className="relative z-10 text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-black">
                جاهز لصناعة <span className="gradient-text">ذكرى لا تُنسى</span>؟
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                انضم إلى آلاف العملاء الذين وثقوا بنا لجعل مناسباتهم استثنائية
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/register"
                  className="group relative inline-flex items-center justify-center gap-2"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-2xl opacity-75 group-hover:opacity-100 blur transition-all" />
                  <div className="relative bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold px-8 py-4 rounded-2xl transition-all group-hover:scale-105">
                    <span className="flex items-center gap-2">
                      ابدأ الآن مجاناً
                      <ArrowLeft size={18} className="rotate-180" />
                    </span>
                  </div>
                </Link>
                
                <Link 
                  href="/contact"
                  className="glass hover:bg-white/10 font-semibold px-8 py-4 rounded-2xl transition-all"
                >
                  تواصل معنا
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-yellow-400 to-amber-600 p-2 rounded-xl">
                  <Music className="text-black" size={20} />
                </div>
                <span className="text-xl font-black">Nooryi</span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                منصة حجز الفنانين المحترفين الأولى في المنطقة
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">المنصة</h4>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/artists" 
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    الفنانين
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/about" 
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    عن المنصة
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/faq" 
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    الأسئلة الشائعة
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">حسابي</h4>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/login" 
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    تسجيل الدخول
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/register" 
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    حساب جديد
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/my-bookings" 
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    حجوزاتي
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">الدعم</h4>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/contact" 
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    تواصل معنا
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/faq" 
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    مركز المساعدة
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-8 text-center">
            <p className="text-sm text-white/40">
              © 2026 Nooryi Studio. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}