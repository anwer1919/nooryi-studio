import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  Music, 
  Calendar, 
  Star, 
  ArrowRight, 
  Shield, 
  CreditCard,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  // جلب البيانات مع معالجة الأخطاء
  let artists: any[] = []
  let stats = { artists: 0, bookings: 0, revenue: 0 }

  try {
    artists = await prisma.artist.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        profileImage: true,
        coverImage: true,
        bio: true,
        _count: {
          select: { bookings: true, reviews: true },
        },
      },
    })

    const [totalArtists, totalBookings, allBookings] = await Promise.all([
      prisma.artist.count(),
      prisma.booking.count(),
      prisma.booking.findMany({ select: { grossAmount: true } }),
    ])

    stats = {
      artists: totalArtists,
      bookings: totalBookings,
      revenue: allBookings.reduce((sum, b) => sum + (b.grossAmount || 0), 0),
    }
  } catch (error) {
    console.error("Error fetching home data:", error)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-black" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
              <Shield className="text-yellow-400" size={14} />
              <span className="text-sm text-white/80">منصة معتمدة لحجز المواهب الفنية</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              اصنع مناسبات{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
                استثنائية
              </span>
            </h1>

            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-8">
              منصة Nooryi تجمع لك نخبة من أفضل الفنانين والموسيقيين المحترفين.
              احجز بكل سهولة وشفافية مع ضمان حماية كامل لحقوقك.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="/artists"
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-xl opacity-75 group-hover:opacity-100 blur transition-all" />
                <div className="relative bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold px-8 py-4 rounded-xl flex items-center gap-2">
                  <Music size={20} />
                  تصفح الفنانين
                  <ArrowRight size={16} />
                </div>
              </Link>

              <Link 
                href="/about"
                className="glass hover:bg-white/[0.08] px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all"
              >
                شاهد كيف نعمل
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass rounded-3xl p-8">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="text-green-400" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2">حجز فوري</h3>
            <p className="text-white/60">احجز فنانك المفضل في دقائق معدودة</p>
          </div>

          <div className="glass rounded-3xl p-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
              <CreditCard className="text-blue-400" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2">دفع آمن 100%</h3>
            <p className="text-white/60">معاملات مشفرة ومحمية بالكامل</p>
          </div>

          <div className="glass rounded-3xl p-8">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
              <Shield className="text-purple-400" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2">إلغاء مجاني</h3>
            <p className="text-white/60">استرداد كامل قبل 48 ساعة من الفعالية</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="glass rounded-3xl p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-black text-yellow-400 mb-2">+{stats.artists || 0}</p>
              <p className="text-white/60">فنان محترف</p>
            </div>
            <div>
              <p className="text-4xl font-black text-yellow-400 mb-2">+{stats.bookings || 0}</p>
              <p className="text-white/60">حجز ناجح</p>
            </div>
            <div>
              <p className="text-4xl font-black text-yellow-400 mb-2">4.9</p>
              <p className="text-white/60">متوسط التقييم</p>
            </div>
            <div>
              <p className="text-4xl font-black text-yellow-400 mb-2">24/7</p>
              <p className="text-white/60">دعم فني</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      {artists.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-black mb-2">فنانين مميزين</h2>
              <p className="text-white/60">اختر من بين نخبة من المحترفين</p>
            </div>
            <Link 
              href="/artists" 
              className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              عرض الكل
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {artists.map((artist) => (
              <Link
                key={artist.id}
                href={`/artists/${artist.slug}`}
                className="group glass rounded-3xl overflow-hidden hover:bg-white/[0.08] transition-all duration-500 hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  {artist.coverImage ? (
                    <img
                      src={artist.coverImage}
                      alt={artist.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-yellow-500/20 to-amber-600/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    {artist.profileImage && (
                      <img
                        src={artist.profileImage}
                        alt={artist.name}
                        className="w-12 h-12 rounded-xl object-cover border border-white/10"
                      />
                    )}
                    <div>
                      <h3 className="font-bold">{artist.name}</h3>
                      <p className="text-xs text-white/60">{artist.category}</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/60 line-clamp-2">{artist.bio}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="glass rounded-3xl p-12 text-center bg-gradient-to-br from-yellow-500/5 to-amber-600/5 border-yellow-500/20">
          <h2 className="text-4xl font-black mb-4">جاهز لصناعة ذكرى لا تُنسى؟</h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-8">
            انضم إلى آلاف العملاء الذين وثقوا بنا لجعل مناسباتهم استثنائية
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              href="/artists"
              className="bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-all"
            >
              ابدأ الآن مجاناً
            </Link>
            <Link 
              href="/contact"
              className="glass hover:bg-white/[0.08] px-8 py-4 rounded-xl font-bold transition-all"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}