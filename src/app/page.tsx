import Link from "next/link"
import { Music, Calendar, ShieldCheck, Star, ArrowLeft, PlayCircle } from "lucide-react"

// بيانات تجريبية للفنانين (يمكن استبدالها لاحقاً ببيانات حقيقية من API)
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
    <div className="min-h-screen bg-[#1a0a04] text-white selection:bg-yellow-500/30">
      
      {/* 1. شريط التنقل (Navbar) */}
      <nav className="fixed top-0 w-full z-50 bg-[#1a0a04]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-600 p-2 rounded-xl">
                <Music className="text-black" size={24} />
              </div>
              <span className="text-2xl font-bold text-white tracking-wide">Nooryi Studio</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/artists" className="text-gray-300 hover:text-yellow-500 transition-colors font-medium">الفنانين</Link>
              <Link href="/about" className="text-gray-300 hover:text-yellow-500 transition-colors font-medium">عن المنصة</Link>
              <Link href="/contact" className="text-gray-300 hover:text-yellow-500 transition-colors font-medium">تواصل معنا</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-300 hover:text-white transition-colors font-medium hidden sm:block">
                تسجيل الدخول
              </Link>
              <Link 
                href="/register" 
                className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold px-5 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-yellow-600/20"
              >
                حساب جديد
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. قسم الهيرو (Hero Section) */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* خلفية ضبابية جمالية */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-600/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
            <Star className="text-yellow-500 fill-yellow-500" size={16} />
            <span className="text-sm text-gray-300 font-medium">المنصة الأولى لحجز الفنانين المحترفين</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
            اكتشف أفضل <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">المواهب الفنية</span>
            <br /> لمناسبتك القادمة
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            نربطك بنخبة من الفنانين والموسيقيين المحترفين. احجز موعدك بكل سهولة وشفافية مع نظام أسعار واضح حسب منطقتك.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/artists" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 hover:scale-105 shadow-xl shadow-yellow-600/20"
            >
              تصفح الفنانين
              <ArrowLeft size={20} className="rotate-180" />
            </Link>
            <Link 
              href="/contact" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 border border-white/10 backdrop-blur-sm"
            >
              <PlayCircle size={20} />
              شاهد كيف نعمل
            </Link>
          </div>
        </div>
      </section>

      {/* 3. قسم الميزات (Features) */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">لماذا تختار Nooryi Studio؟</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">نقدم لك تجربة حجز سلسة وموثوقة من البداية حتى نهاية الحدث.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Music className="text-yellow-500" size={32} />}
              title="فنانين محترفين"
              description="نخبة من أفضل الفنانين مع تقييمات حقيقية ومراجعات موثقة من عملاء سابقين."
            />
            <FeatureCard 
              icon={<Calendar className="text-yellow-500" size={32} />}
              title="حجز فوري وآمن"
              description="اختر التاريخ والفترة المناسبة واحجز في دقائق معدودة مع ضمان حماية دفعتك."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-yellow-500" size={32} />}
              title="أسعار شفافة 100%"
              description="تعرف على التكلفة الإجمالية والعربون المطلوب حسب محافظتك فوراً بدون أي رسوم مخفية."
            />
          </div>
        </div>
      </section>

      {/* 4. قسم الفنانين المميزين (Featured Artists) */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">فنانون مميزون</h2>
              <p className="text-gray-400">اكتشف بعضاً من أفضل المواهب المتاحة للحجز</p>
            </div>
            <Link href="/artists" className="hidden md:flex items-center gap-2 text-yellow-500 hover:text-yellow-400 font-medium transition-colors">
              عرض الكل
              <ArrowLeft size={18} className="rotate-180" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArtists.map((artist) => (
              <div 
                key={artist.id} 
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-yellow-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-yellow-900/10"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={artist.image} 
                    alt={artist.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10">
                    {artist.category}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-yellow-500 transition-colors">{artist.name}</h3>
                    <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-lg">
                      <Star className="text-yellow-500 fill-yellow-500" size={14} />
                      <span className="text-sm font-bold text-yellow-500">{artist.rating}</span>
                      <span className="text-xs text-gray-400">({artist.reviews})</span>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/artists/${artist.slug}`}
                    className="block w-full text-center bg-white/5 hover:bg-yellow-600 hover:text-black text-white font-bold py-3 rounded-xl transition-all duration-300 border border-white/10 hover:border-yellow-600"
                  >
                    عرض الملف والحجز
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Link href="/artists" className="inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-400 font-medium transition-colors">
              عرض جميع الفنانين
              <ArrowLeft size={18} className="rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. ذيل الصفحة (Footer) */}
      <footer className="border-t border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-600 p-1.5 rounded-lg">
                <Music className="text-black" size={20} />
              </div>
              <span className="text-xl font-bold text-white">Nooryi Studio</span>
            </div>
            
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/about" className="hover:text-white transition-colors">عن المنصة</Link>
              <Link href="/faq" className="hover:text-white transition-colors">الأسئلة الشائعة</Link>
              <Link href="/contact" className="hover:text-white transition-colors">تواصل معنا</Link>
            </div>
            
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Nooryi Studio. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// مكون مساعد لبطاقات الميزات
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-300 group">
      <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 border border-yellow-500/20">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}