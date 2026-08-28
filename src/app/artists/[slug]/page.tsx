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
  Music,
  MapPin,
  CheckCircle2,
  Clock,
  Users,
  Award
} from "lucide-react"

export const dynamic = "force-dynamic"

function formatSafeDate(date: Date | string): string {
  try {
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  } catch {
    return "تاريخ غير صالح"
  }
}

export default async function ArtistDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await getServerSession(authOptions)

  let artist = null
  try {
    artist = await prisma.artist.findUnique({
      where: { slug },
      include: {
        reviews: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { bookings: true, reviews: true },
        },
      },
    })
  } catch (error) {
    console.error("Error fetching artist:", error)
  }

  if (!artist) {
    redirect("/artists")
  }

  let venues: any[] = []
  try {
    venues = await prisma.venue.findMany({
      take: 10,
      select: { id: true, name: true, address: true },
    })
  } catch (error) {
    console.error("Error fetching venues:", error)
  }

  if (venues.length === 0) {
    try {
      const defaultVenue = await prisma.venue.create({
        data: { name: "مكان عام", address: "سيتم تحديده لاحقاً" },
      })
      venues = [defaultVenue]
    } catch (error) {
      console.error("Error creating default venue:", error)
    }
  }

  const ratings = artist.reviews?.map((r: any) => r.rating) || []
  const avgRating = ratings.length > 0
    ? ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length
    : 0

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg">
      {/* Cover Image */}
      <div className="relative h-[400px] overflow-hidden">
        {artist.coverImage ? (
          <img
            src={artist.coverImage}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent dark:from-dark-bg dark:via-dark-bg/50" />

        <Link
          href="/artists"
          className="absolute top-6 right-6 glass rounded-xl px-4 py-2 flex items-center gap-2 hover:bg-white/20 transition-colors bg-white/80 dark:bg-dark-surface/80 text-primary dark:text-white border border-gray-200 dark:border-dark-border"
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
            <div className="card-premium">
              <div className="flex items-start gap-4 mb-6">
                {artist.profileImage && (
                  <img
                    src={artist.profileImage}
                    alt={artist.name}
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-dark-surface shadow-soft"
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-4xl font-black text-primary dark:text-white mb-2">{artist.name}</h1>
                  <p className="text-lg text-accent font-semibold mb-3">{artist.category || "فنان"}</p>
                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    <div className="flex items-center gap-1 bg-accent/10 dark:bg-accent-dark/20 px-3 py-1.5 rounded-lg">
                      <Star className="text-accent fill-accent" size={16} />
                      <span className="font-bold text-primary dark:text-white">
                        {avgRating > 0 ? avgRating.toFixed(1) : "جديد"}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        ({artist._count?.reviews || 0} تقييم)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-primary/10 dark:bg-accent/20 px-3 py-1.5 rounded-lg">
                      <Calendar className="text-primary dark:text-accent" size={16} />
                      <span className="font-semibold text-primary dark:text-white">
                        {artist._count?.bookings || 0} حجز ناجح
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-primary dark:text-white mb-3 flex items-center gap-2">
                <Music size={20} className="text-accent" />
                نبذة عن الفنان
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {artist.bio || "لا توجد سيرة ذاتية متاحة"}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="card-premium text-center">
                <div className="w-12 h-12 rounded-xl bg-accent/20 dark:bg-accent-dark/20 flex items-center justify-center mx-auto mb-3">
                  <Star className="text-accent" size={24} />
                </div>
                <p className="text-2xl font-black text-primary dark:text-white">
                  {avgRating > 0 ? avgRating.toFixed(1) : "-"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">التقييم العام</p>
              </div>

              <div className="card-premium text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-accent/20 flex items-center justify-center mx-auto mb-3">
                  <Users className="text-primary dark:text-accent" size={24} />
                </div>
                <p className="text-2xl font-black text-primary dark:text-white">
                  {artist._count?.bookings || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">حجز مكتمل</p>
              </div>

              <div className="card-premium text-center">
                <div className="w-12 h-12 rounded-xl bg-accent/20 dark:bg-accent-dark/20 flex items-center justify-center mx-auto mb-3">
                  <Award className="text-accent" size={24} />
                </div>
                <p className="text-2xl font-black text-primary dark:text-white">
                  {artist._count?.reviews || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">تقييم عملاء</p>
              </div>
            </div>

            {/* Reviews */}
            {artist.reviews && artist.reviews.length > 0 && (
              <div className="card-premium">
                <h3 className="text-xl font-bold text-primary dark:text-white mb-6 flex items-center gap-2">
                  <Star className="text-accent fill-accent" size={20} />
                  التقييمات ({artist.reviews.length})
                </h3>
                <div className="space-y-4">
                  {artist.reviews.map((review: any, i: number) => (
                    <div 
                      key={i} 
                      className="p-5 bg-background-subtle dark:bg-dark-bg rounded-2xl border border-gray-100 dark:border-dark-border"
                    >
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, idx) => (
                          <Star
                            key={idx}
                            size={16}
                            className={idx < review.rating ? "text-accent fill-accent" : "text-gray-200 dark:text-gray-700"}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {review.comment || "تقييم ممتاز"}
                      </p>
                      <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                        <Clock size={12} />
                        {formatSafeDate(review.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Form Sidebar */}
          <div className="lg:col-span-1">
            <div className="card-premium sticky top-24">
              <h3 className="text-xl font-bold text-primary dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="text-accent" size={20} />
                احجز الآن
              </h3>

              {/* Price Preview */}
              <div className="bg-gradient-to-br from-accent/10 to-primary/5 dark:from-accent-dark/20 dark:to-primary/10 rounded-2xl p-5 mb-6 border border-accent/20 dark:border-accent-dark/30">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">السعر التقديري</p>
                <p className="text-3xl font-black text-primary dark:text-accent">5,000 <span className="text-sm">ج.م</span></p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-accent" />
                  العربون: 1,000 ج.م (20%)
                </p>
              </div>

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