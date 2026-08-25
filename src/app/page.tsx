import Link from "next/link"
import { Music, Calendar, ShieldCheck, Star, ArrowLeft, PlayCircle, CheckCircle2, Sparkles } from "lucide-react"

const featuredArtists = [
  {
    id: 1,
    name: "فرقة الطرب الأصيل",
    category: "موسيقى شرقية",
    rating: 4.9,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800",
    slug: "tarab-aseel"
  },
  {
    id: 2,
    name: "دي جي نور",
    category: "موسيقى إلكترونية",
    rating: 4.8,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?auto=format&fit=crop&q=80&w=800",
    slug: "dj-noor"
  },
  {
    id: 3,
    name: "عازف العود محمد",
    category: "موسيقى كلاسيكية",
    rating: 5.0,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1514117445516-2ecfc9c4ec90?auto=format&fit=crop&q=80&w=800",
    slug: "oud-mohammed"
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200">
      
      {/* ═══════════════════════════════════════════
          1. Navbar - شريط تنقل أنيق
      ═══════════════════════════════════════════ */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-400 to-yellow-600 p-2.5 rounded-xl shadow-lg shadow-amber-500/20">
                <Music className="text-black" size={22} />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Nooryi Studio</span>
            </div>
            
            <div className="hidden md:flex items-center gap-10">
              <Link href="/artists" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">الفنانين</Link>
              <Link href="/about" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">عن المنصة</Link>
              <Link href="/contact" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">تواصل معنا</Link>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors hidden sm:block">
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
          2. Hero Section - Split Layout احترافي
      ═══════════════════════════════════════════ */}
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
        {/* شبكة خلفية دقيقة */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* توهج ذهبي ناعم */}
        <div className="absolute top-20 -right-40 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px] -z-10" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* الجانب الأيمن: المحتوى النصي */}
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-amber-500/5 border border-amber-500/20 rounded-full px-4 py-1.5 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="text-xs font-semibold text-amber-200 tracking-wide">+500 فنان متاح للحجز الآن</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-8">
                اصنع مناسبة
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-600">
                    لا تُنسى
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                    <path d="M2 9C50 3 150 3 198 9" stroke="url(#underline-gradient)" strokeWidth="3" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="underline-gradient" x1="0" y1="0" x2="200" y2="0">
                        <stop stopColor="#FCD34D"/>
                        <stop offset="1" stopColor="#D97706"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>
              
              <p className="text-lg text-neutral-400 leading-relaxed mb-10 max-w-lg">
                منصة Nooryi Studio تجمع لك نخبة من الفنانين المحترفين في مكان واحد. 
                اختر، احجز، واستمتع بتجربة حجز شفافة وآمنة من البداية للنهاية.
              </p>

              {/* شريط بحث سريع */}
              <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-2 mb-8 shadow-2xl shadow-black/50">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex-1 flex items-center gap-3 px-4 w-full">
                    <svg className="w-5 h-5 text-neutral-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                      type="text" 
                      placeholder="ابحث عن فنان، نوع الموسيقى، أو المناسبة..." 
                      className="w-full bg-transparent py-3 text-white placeholder-neutral-500 focus:outline-none text-sm"
                    />
                  </div>
                  <Link 
                    href="/artists"
                    className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold px-8 py-3 rounded-xl hover:from-amber-400 hover:to-yellow-500 transition-all duration-300 text-sm whitespace-nowrap text-center"
                  >
                    ابحث الآن
                  </Link>
                </div>
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

            {/* الجانب الأيسر: العنصر البصري */}
            <div className="order-1 lg:order-2 relative">
              <div className="relative">
                {/* الصورة الرئيسية */}
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-amber-900/20">
                  <img 
                    src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=1200" 
                    alt="عازف موسيقي" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* بطاقة عائمة - إحصائية */}
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

                {/* بطاقة عائمة جانبية */}
                <div className="absolute -left-6 top-12 bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                      <Calendar className="text-black" size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400">الحجز القادم</p>
                      <p className="text-sm font-bold text-white">فرقة الطرب • السبت</p>
                    </div>
                  </div>
                </div>

                {/* بطاقة عائمة علوية */}
                <div className="absolute -right-4 -top-4 bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <ShieldCheck className="text-green-400" size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400">حماية الدفع</p>
                      <p className="text-sm font-bold text-green-400">مضمون 100%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          3. إحصائيات سريعة
      ═══════════════════════════════════════════ */}
      <section className="border-y border-white/5 bg-neutral-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem value="+500" label="فنان محترف" />
            <StatItem value="+2,400" label="حجز ناجح" />
            <StatItem value="4.9" label="متوسط التقييم" />
            <StatItem value="24/7" label="دعم فني" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          4. قسم الميزات
      ═══════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="text-amber-400" size={14} />
              <span className="text-xs font-medium text-neutral-400">لماذا نحن؟</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              تجربة حجز <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600">لا مثيل لها</span>
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              صممنا كل تفصيلة في المنصة لتضمن لك أفضل تجربة ممكنة
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Music className="text-amber-400" size={28} />}
              title="مواهب مُعتمدة"
              description="نختار فنانيك بعناية فائقة، مع ملفات تعريفية شاملة وتقييمات حقيقية من عملاء سابقين."
              gradient="from-amber-500/10 to-transparent"
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-emerald-400" size={28} />}
              title="حجز آمن ومضمون"
              description="نظام دفع محمي يضمن حقك وحق الفنان، مع إمكانية تتبع حالة الحجز لحظة بلحظة."
              gradient="from-emerald-500/10 to-transparent"
            />
            <FeatureCard 
              icon={<Calendar className="text-blue-400" size={28} />}
              title="شفافية كاملة"
              description="لا رسوم مخفية. اعرف التكلفة الإجمالية والعربون المطلوب حسب منطقتك قبل تأكيد الحجز."
              gradient="from-blue-500/10 to-transparent"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          5. قسم الفنانين المميزين
      ═══════════════════════════════════════════ */}
      <section className="py-24 bg-neutral-950/50 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">فنانون في القمة</h2>
              <p className="text-neutral-400">اختر من بين مجموعة منتقاة من أفضل المواهب المتاحة</p>
            </div>
            <Link href="/artists" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium transition-colors text-sm group">
              عرض جميع الفنانين
              <ArrowLeft size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArtists.map((artist) => (
              <div 
                key={artist.id} 
                className="group relative bg-neutral-900/40 border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-900/10"
              >
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={artist.image} 
                    alt={artist.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-80" />
                  
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium text-neutral-200 border border-white/10">
                    {artist.category}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-5">
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">{artist.name}</h3>
                    <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/10">
                      <Star className="text-amber-400 fill-amber-400" size={14} />
                      <span className="text-sm font-bold text-amber-400">{artist.rating}</span>
                      <span className="text-xs text-neutral-500">({artist.reviews})</span>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/artists/${artist.slug}`}
                    className="block w-full text-center bg-white/5 hover:bg-white/10 text-white font-medium py-3 rounded-xl transition-all duration-300 border border-white/5 hover:border-white/10 text-sm"
                  >
                    عرض الملف والتفاصيل
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          6. Call to Action
      ═══════════════════════════════════════════ */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/10 rounded-3xl p-12 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-500/10 blur-[100px]" />
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              جاهز لصناعة ذكرى لا تُنسى؟
            </h2>
            <p className="text-neutral-400 mb-8 max-w-lg mx-auto">
              انضم إلى آلاف العملاء الذين وثقوا بنا لجعل مناسباتهم استثنائية
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/artists"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-xl shadow-amber-500/20"
              >
                <PlayCircle size={18} />
                ابدأ الآن مجاناً
              </Link>
              <Link 
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium px-8 py-4 rounded-full transition-all duration-300 border border-white/10"
              >
                تواصل معنا
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          7. Footer
      ═══════════════════════════════════════════ */}
      <footer className="border-t border-white/5 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-neutral-800 p-2 rounded-lg">
                <Music className="text-amber-400" size={18} />
              </div>
              <span className="text-lg font-bold text-white">Nooryi Studio</span>
            </div>
            
            <div className="flex gap-8 text-sm text-neutral-500">
              <Link href="/about" className="hover:text-white transition-colors">عن المنصة</Link>
              <Link href="/faq" className="hover:text-white transition-colors">الأسئلة الشائعة</Link>
              <Link href="/contact" className="hover:text-white transition-colors">تواصل معنا</Link>
            </div>
            
            <p className="text-sm text-neutral-600">
              © {new Date().getFullYear()} Nooryi Studio. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// مكون مساعد للإحصائيات
function StatItem({ value, label }: { value: string, label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600 mb-2">{value}</p>
      <p className="text-sm text-neutral-500">{label}</p>
    </div>
  )
}

// مكون مساعد لبطاقات الميزات
function FeatureCard({ icon, title, description, gradient }: { icon: React.ReactNode, title: string, description: string, gradient: string }) {
  return (
    <div className={`relative bg-gradient-to-b ${gradient} bg-neutral-900/30 backdrop-blur-sm border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all duration-300 group overflow-hidden`}>
      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
      <p className="text-neutral-400 leading-relaxed text-sm">{description}</p>
    </div>
  )
}