"use client"

import { useState } from "react"
import Link from "next/link"
import { Star, Calendar, Music, Award, Play } from "lucide-react"

interface Artist {
  id: string
  name: string
  slug: string
  category: string | null
  bio: string | null
  profileImage: string | null
  coverImage?: string | null
  rating?: number
  reviewsCount?: number
  bookingsCount?: number
}

export default function ArtistCarousel({ artists }: { artists: Artist[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [endX, setEndX] = useState(0)

  const onStart = (x: number) => { setDragging(true); setStartX(x); setEndX(x) }
  const onMove = (x: number) => { if (dragging) setEndX(x) }
  const onEnd = () => {
    if (!dragging) return
    setDragging(false)
    const diff = endX - startX
    if (diff > 60 && currentIndex > 0) setCurrentIndex(currentIndex - 1)
    if (diff < -60 && currentIndex < artists.length - 1) setCurrentIndex(currentIndex + 1)
  }

  if (!artists || artists.length === 0) return null

  return (
    <div className="relative w-full select-none" dir="rtl">
      <div
        className="relative h-[560px] md:h-[640px] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-visible"
        style={{ perspective: "1500px" }}
        onMouseDown={(e) => onStart(e.clientX)}
        onMouseMove={(e) => onMove(e.clientX)}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={onEnd}
      >
        {artists.map((artist, index) => {
          const position = index - currentIndex
          let transform = ""
          let zIndex = 0
          let opacity = 0

          if (position === 0) {
            transform = "translateX(0) translateY(0) translateZ(100px) rotateY(0deg) scale(1)"
            zIndex = 30
            opacity = 1
          } else if (position === 1 || position === -(artists.length - 1)) {
            transform = "translateX(260px) translateY(50px) translateZ(-100px) rotateY(-15deg) scale(0.85)"
            zIndex = 20
            opacity = 0.6
          } else if (position === -1 || position === artists.length - 1) {
            transform = "translateX(-260px) translateY(50px) translateZ(-100px) rotateY(15deg) scale(0.85)"
            zIndex = 20
            opacity = 0.6
          } else {
            transform = position > 0
              ? "translateX(500px) translateY(90px) translateZ(-300px) rotateY(-30deg) scale(0.7)"
              : "translateX(-500px) translateY(90px) translateZ(-300px) rotateY(30deg) scale(0.7)"
            zIndex = 10
            opacity = 0
          }

          return (
            <div
              key={artist.id}
              className="absolute w-[300px] md:w-[380px] transition-all duration-500 ease-out"
              style={{ transform: transform, transformStyle: "preserve-3d", zIndex: zIndex, opacity: opacity, pointerEvents: position === 0 ? "auto" : "none" }}
            >
              <Link href={"/artists/" + artist.slug} className="block group" draggable={false}>
                <div className="relative bg-white dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#0a0a0a] rounded-3xl overflow-hidden border-2 border-[#D4AF37]/20 shadow-2xl hover:shadow-[#D4AF37]/40 transition-all duration-500 hover:border-[#D4AF37]/50">
                  <div className="relative h-72 md:h-96 overflow-hidden">
                    {artist.coverImage || artist.profileImage ? (
                      <img src={artist.coverImage || artist.profileImage || ""} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" draggable={false} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#D4AF37]/20 to-[#111] flex items-center justify-center">
                        <Music size={80} className="text-[#D4AF37]/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#F4E5B8] rounded-full flex items-center gap-1.5 shadow-lg">
                      <Award size={12} className="text-[#111]" />
                      <span className="text-[10px] font-black text-[#111] uppercase tracking-wider">معتمد</span>
                    </div>
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-full flex items-center gap-1.5 border border-[#D4AF37]/30">
                      <Star size={14} className="text-[#D4AF37] fill-[#D4AF37]" />
                      <span className="text-sm font-black text-white">{artist.rating || "5.0"}</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center shadow-2xl shadow-[#D4AF37]/50">
                        <Play size={24} className="text-[#111] ml-1" fill="#111" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em] mb-1">{artist.category || "فنان"}</p>
                      <h3 className="text-3xl md:text-4xl font-black text-white leading-tight drop-shadow-lg">{artist.name}</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 min-h-[4rem]">
                      {artist.bio || "فنان محترف يقدم أفضل العروض الموسيقية"}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-[#D4AF37]/10">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-[#D4AF37]" />
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{artist.bookingsCount || 0} حجز</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Star size={14} className="text-[#D4AF37]" />
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{artist.reviewsCount || 0} تقييم</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] text-xs font-black rounded-full">احجز الآن</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-center gap-2 mt-6 text-gray-400 dark:text-gray-600 text-sm">
        <span>← اسحب للتنقل بين الفنانين →</span>
      </div>
    </div>
  )
}