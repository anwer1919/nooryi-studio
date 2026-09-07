"use client"

import { useState, useRef, useEffect } from "react"
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
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // سحب بالفأرة أو اللمس
  const handleStart = (clientX: number) => {
    setIsDragging(true)
    setStartX(clientX)
    setCurrentX(clientX)
  }

  const handleMove = (clientX: number) => {
    if (!isDragging) return
    setCurrentX(clientX)
  }

  const handleEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    
    const diff = currentX - startX
    const threshold = 50 // حد السحب
    
    if (diff > threshold && currentIndex > 0) {
      // سحب يمين → السابق
      setCurrentIndex(currentIndex - 1)
    } else if (diff < -threshold && currentIndex < artists.length - 1) {
      // سحب يسار → التالي
      setCurrentIndex(currentIndex + 1)
    }
  }

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => handleStart(e.clientX)
  const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX)
  const onMouseUp = () => handleEnd()
  const onMouseLeave = () => { if (isDragging) handleEnd() }

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientX)
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX)
  const onTouchEnd = () => handleEnd()

  if (artists.length === 0) return null

  return (
    <div className="relative w-full select-none" dir="rtl">
      {/* حاوية البطاقات */}
      <div
        ref={containerRef}
        className="relative h-[560px] md:h-[640px] flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ perspective: "1500px" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {artists.map((artist, index) => {
          const position = index - currentIndex
          
          let transform = ""
          let zIndex = 0
          let opacity = 0

          if (position === 0) {
            // البطاقة النشطة في المنتصف
            transform = "translateX(0) translateY(0) translateZ(100px) rotateY(0deg) scale(1)"
            zIndex = 30
            opacity = 1
          } else if (position === 1 || position === -(artists.length - 1)) {
            // البطاقة على اليمين (أصغر وأدنى)
            transform = "translateX(280px) translateY(40px) translateZ(-100px) rotateY(-15deg) scale(0.85)"
            zIndex = 20
            opacity = 0.7
          } else if (position === -1 || position === artists.length - 1) {
            // البطاقة على اليسار (أصغر وأدنى)
            transform = "translateX(-280px) translateY(40px) translateZ(-100px) rotateY(15deg) scale(0.85)"
            zIndex = 20
            opacity = 0.7
          } else {
            // البطاقات الأخرى (مخفية)
            transform = position > 0 
              ? "translateX(500px) translateY(80px) translateZ(-300px) rotateY(-30deg) scale(0.7)"
              : "translateX(-500px) translateY(80px) translateZ(-300px) rotateY(30deg) scale(0.7)"
            zIndex = 10
            opacity = 0
          }

          return (
            <div
              key={artist.id}
              className="absolute w-[320px] md:w-[380px] transition-all duration-500 ease-out"
              style={{
                transform,
                transformStyle: "preserve-3d",
                zIndex,
                opacity,
                pointerEvents: position === 0 ? "auto" : "none",
              }}
            >
              <Link href={`/artists/${artist.slug}`} className="block group" draggable={false}>
                <div className="relative bg-white dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#0a0a0a] rounded-3xl overflow-hidden border-2 border-[#D4AF37]/20 shadow-2xl hover:shadow-[#D4AF37]/40 transition-all duration-500 hover:border-[#D4AF37]/50">
                  {/* صورة الفنان */}
                  <div className="relative h-80 md:h-96 overflow-hidden">
                    {artist.coverImage || artist.profileImage ? (
                      <img
                        src={artist.coverImage || artist.profileImage || ""}
                        alt={artist.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        draggable={false}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#D4AF37]/20 to-[#111] flex items-center justify-center">
                        <Music size={80} className="text-[#D4AF37]/30" />
                      </div>
                    )}

                    {/* تأثير التدرج */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

                    {/* شارة "معتمد" */}
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#F4E5B8] rounded-full flex items-center gap-1.5 shadow-lg">
                      <Award size={12} className="text-[#111]" />
                      <span className="text-[10px] font-black text-[#111] uppercase tracking-wider">معتمد</span>
                    </div>

                    {/* التقييم */}
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-full flex items-center gap-1.5 border border-[#D4AF37]/30">
                      <Star size={14} className="text-[#D4AF37] fill-[#D4AF37]" />
                      <span className="text-sm font-black text-white">
                        {artist.rating || "5.0"}
                      </span>
                    </div>

                    {/* زر التشغيل */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center shadow-2xl shadow-[#D4AF37]/50 animate-pulse-gold">
                        <Play size={24} className="text-[#111] ml-1" fill="#111" />
                      </div>
                    </div>

                    {/* معلومات على الصورة */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em] mb-1">
                        {artist.category || "فنان"}
                      </p>
                      <h3 className="text-3xl md:text-4xl font-black text-white leading-tight drop-shadow-lg">
                        {artist.name}
                      </h3>
                    </div>
                  </div>

                  {/* التفاصيل */}
                  <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 min-h-[4rem]">
                      {artist.bio || "فنان محترف يقدم أفضل العروض الموسيقية"}
                    </p>

                    {/* الإحصائيات */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#D4AF37]/10">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-[#D4AF37]" />
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                            {artist.bookingsCount || 0} حجز
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Star size={14} className="text-[#D4AF37]" />
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                            {artist.reviewsCount || 0} تقييم
                          </span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] text-xs font-black rounded-full hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all duration-300 group-hover:scale-105">
                        احجز الآن
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                      </span>
                    </div>
                  </div>

                  {/* توهج ذهبي */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#D4AF37]/0 via-[#D4AF37]/0 to-[#D4AF37]/0 group-hover:from-[#D4AF37]/5 group-hover:via-transparent group-hover:to-[#D4AF37]/5 transition-all duration-500 pointer-events-none"></div>
                </div>
              </Link>
            </div>
          )
        })}
      </div>

      {/* مؤشر السحب */}
      <div className="flex items-center justify-center gap-2 mt-8 text-gray-400 dark:text-gray-600 text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 9l-3 3 3 3"/>
          <path d="M9 5l3-3 3 3"/>
          <path d="M15 19l-3 3-3-3"/>
          <path d="M19 9l3 3-3 3"/>
        </svg>
        <span>اسحب للتنقل بين الفنانين</span>
      </div>
    </div>
  )
}