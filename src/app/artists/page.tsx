"use client"

import { useEffect, useState } from "react"
import { Search, Music, Star, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import FluidBackground from "@/components/FluidBackground"

interface Artist {
  id: string
  name: string
  slug: string
  category: string | null
  bio: string | null
  profileImage: string | null
  accentColor: string
  rating?: number
  reviewCount?: number
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("ALL")

  useEffect(() => {
    fetchArtists()
  }, [])

  useEffect(() => {
    filterArtists()
  }, [artists, searchQuery, categoryFilter])

  const fetchArtists = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/artists")
      if (res.ok) {
        const data = await res.json()
        setArtists(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filterArtists = () => {
    let result = artists
    if (searchQuery.trim()) {
      result = result.filter(artist =>
        artist.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    if (categoryFilter !== "ALL") {
      result = result.filter(artist => artist.category === categoryFilter)
    }
    setFilteredArtists(result)
  }

  const categories = ["ALL", "Singer", "DJ", "Band", "Comedian", "Magician", "Other"]

  return (
    <div className="relative min-h-screen bg-[#1a0a04]">
      <FluidBackground scrimStrength="strong" />

      <div className="relative z-10 min-h-screen">
        <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-yellow-500 to-amber-700 rounded-lg flex items-center justify-center">
                <Music size={18} className="text-black" />
              </div>
              <span className="text-xl font-bold text-yellow-500">Nooryi Studio</span>
            </Link>
            <Link href="/my-bookings" className="text-white/70 hover:text-yellow-500 transition text-sm font-medium">
              حجوزاتي
            </Link>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12 animate-fade-up">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">استكشف فنانينا</h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">اختر من بين نخبة من الفنانين المحترفين لإحياء حفلتك الخاصة</p>
          </div>

          <div className="bg-white/8 backdrop-blur-xl border border-white/16 rounded-2xl p-4 mb-8 animate-fade-up-delay">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن فنان..."
                  className="w-full pr-10 pl-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-yellow-500 focus:outline-none transition"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="md:w-48 py-3 px-4 bg-black/40 border border-white/10 rounded-lg text-white focus:border-yellow-500 focus:outline-none transition"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === "ALL" ? "جميع الفئات" : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="mx-auto animate-spin text-yellow-500 mb-4" size={40} />
              <p className="text-white/60">جاري تحميل الفنانين...</p>
            </div>
          ) : filteredArtists.length === 0 ? (
            <div className="text-center py-20">
              <Music className="mx-auto text-white/30 mb-4" size={64} />
              <p className="text-white/60 text-lg mb-2">
                {searchQuery || categoryFilter !== "ALL" ? "لا توجد نتائج مطابقة للبحث" : "لا يوجد فنانون حالياً"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtists.map((artist, index) => (
                <Link
                  key={artist.id}
                  href={`/artists/${encodeURIComponent(artist.slug)}`}
                  className="group bg-white/8 backdrop-blur-xl border border-white/16 rounded-2xl overflow-hidden hover:border-yellow-500/50 transition-all duration-300 hover:-translate-y-1 animate-fade-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="relative aspect-square overflow-hidden bg-black/40">
                    {artist.profileImage ? (
                      <Image
                        src={artist.profileImage}
                        alt={artist.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-6xl font-bold"
                        style={{ color: artist.accentColor, backgroundColor: `${artist.accentColor}20` }}
                      >
                        {artist.name.charAt(0)}
                      </div>
                    )}
                    <div
                      className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md"
                      style={{
                        backgroundColor: `${artist.accentColor}30`,
                        color: artist.accentColor,
                        border: `1px solid ${artist.accentColor}50`
                      }}
                    >
                      {artist.category || "فنان"}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-500 transition">
                      {artist.name}
                    </h3>
                    {artist.bio && (
                      <p className="text-white/60 text-sm line-clamp-2 mb-3">{artist.bio}</p>
                    )}
                    {artist.rating !== undefined && artist.rating > 0 && (
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star size={16} className="fill-yellow-400" />
                        <span className="font-bold">{artist.rating.toFixed(1)}</span>
                        <span className="text-white/40 text-sm">({artist.reviewCount || 0})</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        :global(.animate-fade-up) {
          animation: fade-up 0.7s cubic-bezier(0.2, 0, 0, 1) both;
        }
        :global(.animate-fade-up-delay) {
          animation: fade-up 0.7s cubic-bezier(0.2, 0, 0, 1) 0.2s both;
        }
      `}</style>
    </div>
  )
}