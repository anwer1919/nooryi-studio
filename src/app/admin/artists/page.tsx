import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Music, Search, Star } from "lucide-react"

export const dynamic = "force-dynamic" // منع الكاش

export default async function ArtistsPage() {
  // جلب جميع الفنانين بدون شروط معقدة
  let artists: any[] = []
  
  try {
    artists = await prisma.artist.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    })
    
    console.log("✅ تم جلب الفنانين:", artists.length)
  } catch (error) {
    console.error("❌ خطأ في جلب الفنانين:", error)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4">استكشف فنانينا</h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            اختر من بين نخبة من الفنانين المحترفين لإحياء حفلتك الخاصة
          </p>
        </div>

        {/* Search & Filter */}
        <div className="glass rounded-2xl p-4 mb-8 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="ابحث عن فنان..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-10 pl-4 text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-500/50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["الكل", "موسيقى شرقية", "موسيقى إلكترونية", "موسيقى كلاسيكية"].map((cat) => (
              <button 
                key={cat}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition-colors border border-white/10"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Artists Grid */}
        {artists.length === 0 ? (
          <div className="glass rounded-3xl p-16 text-center">
            <Music className="mx-auto mb-4 text-white/40" size={64} />
            <h3 className="text-2xl font-bold mb-2">لا يوجد فنانون حالياً</h3>
            <p className="text-white/60 mb-6">
              عذراً، لا تتوفر حالياً أي فنانين للعرض
            </p>
            <div className="text-sm text-white/40">
              تم فحص قاعدة البيانات: {artists.length} فنان موجود
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 text-white/60">
              عدد الفنانين المتاحين: <span className="font-bold text-yellow-400">{artists.length}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artists.map((artist) => (
                <Link
                  key={artist.id}
                  href={`/artists/${artist.slug}`}
                  className="group glass rounded-3xl overflow-hidden hover:bg-white/[0.08] transition-all duration-500 hover:-translate-y-1"
                >
                  {/* Cover Image */}
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
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-green-500/10 text-green-400 border-green-500/20">
                        {artist.status === "ACTIVE" ? "نشط" : "معلق"}
                      </span>
                    </div>

                    {/* Category */}
                    {artist.category && (
                      <div className="absolute bottom-3 right-3">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-sm border border-white/10">
                          {artist.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {artist.profileImage ? (
                          <img 
                            src={artist.profileImage} 
                            alt={artist.name}
                            className="w-12 h-12 rounded-xl object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                            <Music className="text-yellow-400" size={20} />
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold mb-0.5">{artist.name}</h3>
                          <p className="text-xs text-white/60">{artist.category || "فنان"}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-white/60 line-clamp-2 mb-4">
                      {artist.bio || "لا توجد سيرة ذاتية"}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-1">
                        <Star className="text-yellow-400 fill-yellow-400" size={14} />
                        <span className="text-sm font-semibold">
                          {artist._count?.reviews || 0}
                        </span>
                        <span className="text-xs text-white/40">تقييم</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Music className="text-yellow-400" size={14} />
                        <span className="text-sm font-semibold">
                          {artist._count?.bookings || 0}
                        </span>
                        <span className="text-xs text-white/40">حجز</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}