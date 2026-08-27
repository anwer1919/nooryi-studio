import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import BookingForm from "./BookingForm"
import { 
  ArrowRight, 
  Star, 
  Calendar, 
  MapPin, 
  Music,
  Shield,
  Clock,
  CheckCircle2
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ArtistDetailsPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)

  const artist = await prisma.artist.findUnique({
    where: { slug: params.slug },
    include: {
      reviews: {
        select: { rating: true, comment: true },
      },
      pricing: true,
      _count: {
        select: { bookings: true, reviews: true },
      },
    },
  })

  if (!artist) {
    redirect("/artists")
  }

  // جلب الأماكن للحجز
  const venues = await prisma.venue.findMany({
    select: { id: true, name: true, address: true },
  })

  // حساب متوسط التقييم
  const ratings = artist.reviews.map((r) => r.rating)
  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : 0

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Cover Image */}
      <div className="relative h-[400px] overflow-hidden">
        {artist.coverImage ? (
          <img
            src={artist.coverImage}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-yellow-500/20 to-amber-600/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Back Button */}
        <Link
          href="/artists"
          className="absolute top-6 right-6 glass rounded-xl px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors"
        >
          <ArrowRight size={16} />
          العودة
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 -mt-32 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Artist Info Card */}
            <div className="glass rounded-3xl p-8">
              <div className="flex items-start gap-4 mb-6">
                {artist.profileImage && (
                  <img
                    src={artist.profileImage}
                    alt={artist.name}
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-black"
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-4xl font-black mb-2">{artist.name}</h1>
                  <p className="text-lg text-white/60 mb-3">{artist.category}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-400 fill-yellow-400" size={16} />
                      <span className="font-bold">{avgRating > 0 ? avgRating.toFixed(1) : "جديد"}</span>
                      <span className="text-white/40">({artist._count.reviews} تقييم)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="text-yellow-400" size={16} />
                      <span>{artist._count.bookings} حجز ناجح</span>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-3">نبذة عن الفنان</h3>
              <p className="text-white/70 leading-relaxed">
                {artist.bio || "لا توجد سيرة ذاتية متاحة"}
              </p>
            </div>

            {/* Reviews */}
            {artist.reviews.length > 0 && (
              <div className="glass rounded-3xl p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Star className="text-yellow-400" size={20} />
                  التقييمات ({artist.reviews.length})
                </h3>
                <div className="space-y-4">
                  {artist.reviews.slice(0, 3).map((review, i) => (
                    <div key={i} className="bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, idx) => (
                          <Star
                            key={idx}
                            size={14}
                            className={idx < review.rating ? "text-yellow-400 fill-yellow-400" : "text-white/20"}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-white/70">{review.comment || "تقييم ممتاز"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Form Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass rounded-3xl p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="text-yellow-400" size={20} />
                احجز الآن
              </h3>

              <BookingForm 
                artistId={artist.id}
                artistName={artist.name}
                venues={venues}
                userEmail={session?.user?.email || ""}
                userName={session?.user?.name || ""}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}