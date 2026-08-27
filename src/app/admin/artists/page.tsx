import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  Music, 
  ArrowRight, 
  Plus, 
  Star,
  Edit,
  Trash2,
  MoreVertical
} from "lucide-react"

export default async function AdminArtistsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN")) {
    redirect("/login")
  }

  const artists = await prisma.artist.findMany({
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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link 
              href="/admin" 
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-4 transition-colors"
            >
              <ArrowRight size={16} className="rotate-180" />
              العودة للوحة التحكم
            </Link>
            <h1 className="text-4xl font-black mb-2">إدارة الفنانين</h1>
            <p className="text-white/60">إجمالي {artists.length} فنان</p>
          </div>
          <Link 
            href="/admin/artists/new"
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-xl opacity-75 group-hover:opacity-100 blur transition-all" />
            <div className="relative bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2">
              <Plus size={18} />
              إضافة فنان
            </div>
          </Link>
        </div>

        {/* Artists Grid */}
        {artists.length === 0 ? (
          <div className="glass rounded-3xl p-16 text-center">
            <Music className="mx-auto mb-4 text-white/40" size={64} />
            <h3 className="text-xl font-bold mb-2">لا يوجد فنانون</h3>
            <p className="text-white/60 mb-6">ابدأ بإضافة فنانك الأول</p>
            <Link 
              href="/admin/artists/new"
              className="inline-flex items-center gap-2 bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors"
            >
              <Plus size={18} />
              إضافة فنان جديد
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artists.map((artist) => (
              <div 
                key={artist.id}
                className="group glass rounded-3xl overflow-hidden hover:bg-white/[0.08] transition-all duration-500 hover:-translate-y-1"
              >
                {/* Cover Image */}
                <div className="relative h-32 overflow-hidden">
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
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      artist.status === "ACTIVE" 
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                    }`}>
                      {artist.status === "ACTIVE" ? "نشط" : "معلق"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{artist.name}</h3>
                      <p className="text-sm text-white/60">{artist.category || "غير مصنف"}</p>
                    </div>
                    <button className="text-white/40 hover:text-white transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  <p className="text-sm text-white/60 line-clamp-2 mb-4">
                    {artist.bio || "لا توجد سيرة ذاتية"}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-400 fill-yellow-400" size={14} />
                      <span className="font-semibold">{artist._count.reviews}</span>
                      <span className="text-white/40">تقييم</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Music className="text-yellow-400" size={14} />
                      <span className="font-semibold">{artist._count.bookings}</span>
                      <span className="text-white/40">حجز</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link 
                      href={`/admin/artists/${artist.slug}/edit`}
                      className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-2.5 rounded-xl text-sm font-semibold transition-colors border border-white/10"
                    >
                      <Edit size={14} />
                      تعديل
                    </Link>
                    <Link 
                      href={`/artists/${artist.slug}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 py-2.5 rounded-xl text-sm font-semibold transition-colors border border-yellow-500/20"
                    >
                      عرض
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}