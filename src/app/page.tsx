import Link from "next/link"
import { Music, Calendar, ShieldCheck, Star, ArrowLeft, PlayCircle, CheckCircle2 } from "lucide-react"

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
      
      {/* 1. Navbar أنيق وعصري */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/70 backdrop-blur-xl">
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

      {/* 2. Hero Section سينمائي */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* تأثيرات إضاءة خلفية ناعمة */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md">
            <Star className="text-amber-400 fill-amber-400" size={14} />
            <span className="text-xs font-medium text-neutral-300">المنصة الأولى المعتمدة لحجز المواهب</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 leading-[1.15] tracking-tight">
            اكتشف نخبة <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600">الفنانين المحترفين</span>
            <br className="hidden md:block" /> لمناسبتك الاستثنائية
          </h1>
          
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            نربطك بأفضل المواهب الموسيقية والغنائية. احجز موعدك بكل سهولة مع نظام أسعار شفاف وآمن يضمن لك راحة البال.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/artists" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold px-8 py-4 rounded-full text-base transition-all duration-300 hover:scale-[1.02] shadow-xl shadow-amber-500/20"
            >
              تصفح الفنانين الآن
              <ArrowLeft size={18} className="rotate-180" />
            </Link>
            <Link 
              href="/contact" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium px-8 py-4 rounded-full text-base transition-all duration-300 border border-white/10 backdrop-blur-sm"
            >
              <PlayCircle size={18} />
              كيف تعمل المنصة؟
            </Link>
          </div>
        </div>
      </section>

      {/* 3. قسم الميزات (بأيقونات وتأثيرات دقيقة) */}
      <section className="py-24 border-t border-white/5 bg-neutral-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Music className="text-amber-400" size={28} />}
              title="مواهب مُعتمدة"
              description="نختار فنانيك بعناية فائقة، مع ملفات تعريفية شاملة وتقييمات حقيقية من عملاء سابقين."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-amber-400" size={28} />}
              title="حجز آمن ومضمون"
              description="نظام دفع محمي يضمن حقك وحق الفنان، مع إمكانية تتبع حالة الحجز لحظة بلحظة."
            />
            <FeatureCard 
              icon={<Calendar className="text-amber-400" size={28} />}
              title="شفافية كاملة في الأسعار"
              description="لا رسوم مخفية. اعرف التكلفة الإجمالية والعربون المطلوب حسب منطقتك قبل تأكيد الحجز."
            />
          </div>
        </div>
      </section>

      {/* 4. قسم الفنانين المميزين (بطاقات عصرية) */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">فنانون في القمة</h2>
              <p className="text-neutral-400">اختر من بين مجموعة منتقاة من أفضل المواهب المتاحة</p>
            </div>
            <Link href="/artists" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium transition-colors text-sm">
              عرض جميع الفنانين
              <ArrowLeft size={16} className="rotate-180" />
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
                  {/* تدرج داكن فوق الصورة لدمجها مع البطاقة */}
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

      {/* 5. Footer أنيق وبسيط */}
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

// مكون مساعد للبطاقات بتصميم دقيق
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-neutral-900/30 backdrop-blur-sm border border-white/5 rounded-2xl p-8 hover:bg-neutral-900/50 hover:border-white/10 transition-all duration-300 group">
      <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-amber-500/10">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
      <p className="text-neutral-400 leading-relaxed text-sm">{description}</p>
    </div>
  )
}