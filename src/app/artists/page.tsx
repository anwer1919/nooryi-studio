import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Music, Star, Search, Filter } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ArtistsPage() {
  const artists = await prisma.artist.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      bio: true,
      profileImage: true,
      _count: { select: { reviews: true, bookings: true } },
      reviews: { select: { rating: true } },
    },
  }).catch(() => [])

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-gray-100 dark:border-dark-border">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-primary/5 dark:from-accent-dark/10 dark:via-dark-bg dark:to-primary/10" />
        <div className="absolute top-10 right-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 dark:bg-accent-dark/20 text-primary dark:text-accent text-sm font-semibold mb-4">
              <Music size={16} />
              <span>اكتشف أفضل الفنانين</span>
            </div>
            <h1 className="text-5xl font-black text-primary dark:text-white mb-4">
              فنانون <span className="text-accent">مميزون</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              اختر من بين نخبة من أفضل الفنانين والموسيقيين لفعالياتك الخاصة
            </p>
          </div>
        </div>
      </section>

      {/* Artists Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {artists.length === 0 ? (
          <div className="card-premium text-center py-20">
            <Music className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={64} />
            <h3 className="text-2xl font-bold text-primary dark:text-white mb-2">لا يوجد فنانون حالياً</h3>
            <p className="text-gray-500 dark:text-gray-400">سيتم إضافة فنانين جدد قريباً</p>
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
                        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <Music className="text-primary dark:text-accent" size={64} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <span className="text-white font-bold text-lg flex items-center gap-2">
                        عرض التفاصيل ←
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-primary dark:text-white mb-1">{artist.name}</h3>
                  <p className="text-sm text-accent font-semibold mb-3">{artist.category}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {artist.bio || "فنان محترف يقدم أداءً مميزاً"}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
                    <div className="flex items-center gap-1">
                      <Star className="text-accent fill-accent" size={16} />
                      <span className="font-bold text-primary dark:text-white">
                        {avgRating > 0 ? avgRating.toFixed(1) : "جديد"}
                      </span>
                      <span className="text-gray-400 text-xs">({artist._count.reviews} تقييم)</span>
                    </div>
                    <span className="text-xs font-semibold text-primary dark:text-accent bg-accent/10 dark:bg-accent-dark/20 px-2 py-1 rounded-lg">
                      {artist._count.bookings} حجز
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}