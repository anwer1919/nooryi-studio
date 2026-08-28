import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Music, Star, Calendar, ArrowRight, Sparkles, Users, Shield } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const artists = await prisma.artist.findMany({
    where: { status: "ACTIVE" },
    take: 6,
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      profileImage: true,
      _count: { select: { reviews: true, bookings: true } },
      reviews: { select: { rating: true } },
    },
  }).catch(() => [])

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-primary/5 dark:from-accent-dark/10 dark:via-dark-bg dark:to-primary/10" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 dark:bg-accent-dark/20 text-primary dark:text-accent text-sm font-semibold mb-6">
              <Sparkles size={16} />
              <span>منصة حجز الفنانين الأولى</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-primary dark:text-white leading-tight mb-6">
              احجز أفضل الفنانين
              <br />
              <span className="bg-gradient-to-r from-primary to-accent dark:from-accent dark:to-accent-light bg-clip-text text-transparent">
                لفعالياتك المميزة
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
              منصة احترافية تجمع بين أفضل الفنانين والموسيقيين في مكان واحد. 
              احجز بسهولة، ادفع بأمان، واستمتع بتجربة لا تُنسى.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/artists" className="btn-primary flex items-center gap-2">
                <Music size={20} />
                تصفح الفنانين
              </Link>
              <Link href="/register" className="btn-secondary flex items-center gap-2">
                <Sparkles size={20} />
                ابدأ الآن مجاناً
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 pt-10 border-t border-gray-200 dark:border-dark-border">
              <div>
                <p className="text-4xl font-black text-primary dark:text-accent">+150</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">فنان محترف</p>
              </div>
              <div>
                <p className="text-4xl font-black text-primary dark:text-accent">+500</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">فعالية ناجحة</p>
              </div>
              <div>
                <p className="text-4xl font-black text-primary dark:text-accent">4.9★</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">تقييم العملاء</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background-subtle dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-primary dark:text-white mb-4">
              لماذا تختار <span className="text-accent">Nooryi</span>؟
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              نوفر لك تجربة حجز استثنائية بأعلى معايير الجودة
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-premium text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-accent/20 flex items-center justify-center mx-auto mb-6">
                <Users className="text-primary dark:text-accent" size={32} />
              </div>
              <h3 className="text-xl font-bold text-primary dark:text-white mb-3">فنانين معتمدين</h3>
              <p className="text-gray-600 dark:text-gray-400">
                جميع الفنانين يخضعون لعملية تحقق صارمة لضمان أعلى مستوى من الاحترافية
              </p>
            </div>

            <div className="card-premium text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-6">
                <Shield className="text-primary dark:text-accent" size={32} />
              </div>
              <h3 className="text-xl font-bold text-primary dark:text-white mb-3">دفع آمن 100%</h3>
              <p className="text-gray-600 dark:text-gray-400">
                نظام دفع مشفر وآمن مع ضمان استرداد كامل في حالة الإلغاء
              </p>
            </div>

            <div className="card-premium text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-accent/20 flex items-center justify-center mx-auto mb-6">
                <Calendar className="text-primary dark:text-accent" size={32} />
              </div>
              <h3 className="text-xl font-bold text-primary dark:text-white mb-3">حجز سهل وسريع</h3>
              <p className="text-gray-600 dark:text-gray-400">
                احجز فنانك المفضل في دقائق مع تأكيد فوري ومتابعة مستمرة
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-4xl font-black text-primary dark:text-white mb-3">
                فنانون مميزون
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                اختر من بين نخبة من أفضل الفنانين
              </p>
            </div>
            <Link 
              href="/artists" 
              className="hidden md:flex items-center gap-2 text-primary dark:text-accent font-semibold hover:gap-3 transition-all"
            >
              عرض الكل
              <ArrowRight size={18} />
            </Link>
          </div>

          {artists.length === 0 ? (
            <div className="card-premium text-center py-16">
              <Music className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={48} />
              <p className="text-gray-500 dark:text-gray-400">لا يوجد فنانون حالياً</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artists.map((artist) => {
                const ratings = artist.reviews?.map((r) => r.rating) || []
                const avgRating = ratings.length > 0
                  ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
                  : 0

                return (
                  <Link 
                    key={artist.id}
                    href={`/artists/${artist.slug}`}
                    className="card-premium group cursor-pointer"
                  >
                    <div className="relative overflow-hidden rounded-xl mb-4">
                      {artist.profileImage ? (
                        <img 
                          src={artist.profileImage}
                          alt={artist.name}
                          className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-56 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <Music className="text-primary dark:text-accent" size={48} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="text-white font-semibold flex items-center gap-2">
                          عرض التفاصيل <ArrowRight size={16} />
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-primary dark:text-white mb-1">{artist.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{artist.category}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
                      <div className="flex items-center gap-1">
                        <Star className="text-accent fill-accent" size={16} />
                        <span className="font-bold text-primary dark:text-white">
                          {avgRating > 0 ? avgRating.toFixed(1) : "جديد"}
                        </span>
                        <span className="text-gray-400 text-xs">({artist._count.reviews})</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {artist._count.bookings} حجز
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          <div className="text-center mt-10 md:hidden">
            <Link href="/artists" className="btn-secondary inline-flex items-center gap-2">
              عرض جميع الفنانين
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-dark">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black text-white mb-4">
            جاهز لبدء رحلتك؟
          </h2>
          <p className="text-white/80 text-lg mb-8">
            انضم إلى آلاف العملاء الذين يثقون بنا في تنظيم فعاليات لا تُنسى
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="btn-secondary flex items-center gap-2">
              <Sparkles size={20} />
              إنشاء حساب مجاني
            </Link>
            <Link 
              href="/contact" 
              className="px-8 py-3 rounded-xl font-bold text-white border-2 border-white/30 hover:bg-white/10 transition-all"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-bg text-white py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-accent w-10 h-10 rounded-xl flex items-center justify-center">
                <Music className="text-primary" size={20} />
              </div>
              <span className="text-2xl font-black">Nooryi<span className="text-accent">.</span></span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2026 Nooryi Studio. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}