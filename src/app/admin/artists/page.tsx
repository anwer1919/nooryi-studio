"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Music, Plus, Search, Edit, Calendar, DollarSign, Star, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Artist {
  id: string
  name: string
  slug: string
  category: string | null
  status: string
  profileImage: string | null
  accentColor: string
  bio: string | null
  rating?: number
  reviewCount?: number
  _count?: {
    bookings: number
    reviews: number
  }
}

export default function AdminArtistsPage() {
  const { data: session } = useSession()
  const [artists, setArtists] = useState<Artist[]>([])
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [error, setError] = useState("")

  const userRole = (session?.user as any)?.role
  const isSuperAdmin = userRole === "SUPER_ADMIN"

  useEffect(() => {
    fetchArtists()
  }, [])

  useEffect(() => {
    filterArtists()
  }, [artists, searchQuery, statusFilter])

  const fetchArtists = async () => {
    setLoading(true)
    setError("")
    
    try {
      const res = await fetch("/api/admin/artists")
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "فشل تحميل الفنانين")
        setLoading(false)
        return
      }
      
      const data = await res.json()
      setArtists(Array.isArray(data) ? data : [])
      setLoading(false)
    } catch (err) {
      console.error(err)
      setError("حدث خطأ أثناء التحميل")
      setLoading(false)
    }
  }

  const filterArtists = () => {
    let result = artists

    // البحث بالاسم
    if (searchQuery.trim()) {
      result = result.filter(artist => 
        artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.slug.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // الفلترة بالحالة
    if (statusFilter !== "ALL") {
      result = result.filter(artist => artist.status === statusFilter)
    }

    setFilteredArtists(result)
  }

  const getStatusInfo = (status: string) => {
    const info: Record<string, { label: string; color: string; icon: any }> = {
      ACTIVE: { label: "نشط", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: Eye },
      INACTIVE: { label: "غير نشط", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: EyeOff },
      PENDING: { label: "قيد المراجعة", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: AlertCircle },
      ARCHIVED: { label: "مؤرشف", color: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30", icon: EyeOff },
    }
    return info[status] || { label: status, color: "bg-neutral-500/20 text-neutral-400", icon: AlertCircle }
  }

  return (
    <div className="space-y-8">
      {/* العنوان والإجراءات */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">إدارة الفنانين</h1>
          <p className="text-neutral-400 mt-1">
            {isSuperAdmin 
              ? "إدارة جميع فناني المنصة" 
              : "إدارة الفنان المسؤول عنه"}
          </p>
        </div>
        
        {isSuperAdmin && (
          <Link
            href="/admin/artists/new"
            className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-6 rounded-lg transition"
          >
            <Plus size={20} />
            إضافة فنان جديد
          </Link>
        )}
      </div>

      {/* أدوات البحث والفلترة */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* البحث */}
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الفنان..."
              className="w-full pr-12 pl-4 py-3 bg-black border border-neutral-700 rounded-lg text-white focus:border-yellow-500 outline-none"
            />
          </div>

          {/* فلتر الحالة */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="md:w-48 p-3 bg-black border border-neutral-700 rounded-lg text-white focus:border-yellow-500 outline-none"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="ACTIVE">نشط</option>
            <option value="INACTIVE">غير نشط</option>
            <option value="PENDING">قيد المراجعة</option>
            <option value="ARCHIVED">مؤرشف</option>
          </select>
        </div>
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* التحميل */}
      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="mx-auto animate-spin text-yellow-500 mb-4" size={40} />
          <p className="text-neutral-500">جاري تحميل الفنانين...</p>
        </div>
      ) : filteredArtists.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
          <Music className="mx-auto text-neutral-600 mb-4" size={64} />
          <p className="text-neutral-400 text-lg mb-2">
            {searchQuery || statusFilter !== "ALL" 
              ? "لا توجد نتائج مطابقة للبحث" 
              : "لا يوجد فنانون بعد"}
          </p>
          {isSuperAdmin && !searchQuery && statusFilter === "ALL" && (
            <Link 
              href="/admin/artists/new" 
              className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-6 rounded-lg transition mt-4"
            >
              <Plus size={20} />
              إضافة أول فنان
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* عدد النتائج */}
          <div className="flex items-center justify-between">
            <p className="text-neutral-400 text-sm">
              عرض {filteredArtists.length} من أصل {artists.length} فنان
            </p>
          </div>

          {/* قائمة الفنانين */}
          <div className="grid gap-6">
            {filteredArtists.map((artist) => {
              const statusInfo = getStatusInfo(artist.status)
              const StatusIcon = statusInfo.icon
              
              return (
                <div 
                  key={artist.id} 
                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* صورة الفنان */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-800 border-2" style={{ borderColor: artist.accentColor }}>
                        {artist.profileImage ? (
                          <img 
                            src={artist.profileImage} 
                            alt={artist.name} 
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none"
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl font-bold" style={{ color: artist.accentColor }}>
                            {artist.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* البيانات */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-3 flex-wrap mb-1">
                            <h3 className="text-xl font-bold text-white">{artist.name}</h3>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                              <StatusIcon size={12} />
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-neutral-400">
                            <span className="flex items-center gap-1">
                              <Music size={14} />
                              {artist.category || "فنان"}
                            </span>
                            {artist.rating !== undefined && artist.rating > 0 && (
                              <span className="flex items-center gap-1 text-yellow-400">
                                <Star size={14} className="fill-yellow-400" />
                                {artist.rating.toFixed(1)}
                                <span className="text-neutral-500">({artist.reviewCount || 0})</span>
                              </span>
                            )}
                            {artist._count && (
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {artist._count.bookings} حجز
                              </span>
                            )}
                          </div>
                        </div>

                        <div 
                          className="w-8 h-8 rounded-full" 
                          style={{ backgroundColor: artist.accentColor }}
                          title={`اللون المميز: ${artist.accentColor}`}
                        />
                      </div>

                      {artist.bio && (
                        <p className="text-neutral-400 text-sm mb-4 line-clamp-2">
                          {artist.bio}
                        </p>
                      )}

                      {/* أزرار الإجراءات */}
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/artists/${artist.slug}`}
                          className="flex items-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-2 px-4 rounded-lg transition text-sm"
                        >
                          <Eye size={16} />
                          عرض الصفحة
                        </Link>
                        
                        <Link
                          href={`/admin/artists/${artist.slug}/edit`}
                          className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black font-medium py-2 px-4 rounded-lg transition text-sm"
                        >
                          <Edit size={16} />
                          تعديل
                        </Link>
                        
                        <Link
                          href={`/admin/artists/${artist.slug}/availability`}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition text-sm"
                        >
                          <Calendar size={16} />
                          المواعيد
                        </Link>
                        
                        {isSuperAdmin && (
                          <Link
                            href={`/admin/artists/${artist.slug}/pricing`}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition text-sm"
                          >
                            <DollarSign size={16} />
                            التسعير
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}