"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { Star, Calendar, Music, Award, Play, ChevronLeft, ChevronRight } from "lucide-react"

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
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentRotation, setCurrentRotation] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  const totalCards = artists.length
  const anglePerCard = 360 / totalCards
  // نصف قطر الدائرة — كلما زاد العدد زادت المسافة
  const radius = Math.max(280, totalCards * 45)

  // ═══ Auto-play ═══
  useEffect(() => {
    if (autoPlay && totalCards > 1) {
      autoPlayRef.current = setInterval(() => {
        setRotation(prev => prev + anglePerCard)
      }, 4000)
    }
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current) }
  }, [autoPlay, anglePerCard, totalCards])

  // ═══ Drag handlers ═══
  const onStart = useCallback((clientX: number) => {
    setIsDragging(true)
    setStartX(clientX)
    setCurrentRotation(rotation)
    setAutoPlay(false)
    if (autoPlayRef.current) clearInterval(autoPlayRef.current)
  }, [rotation])

  const onMove = useCallback((clientX: number) => {
    if (!isDragging) return
    const diff = clientX - startX
    setRotation(currentRotation - diff * 0.5)
  }, [isDragging, startX, currentRotation])

  const onEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    // Snap to nearest card
    const snapped = Math.round(rotation / anglePerCard) * anglePerCard
    setRotation(snapped)
    // Resume auto-play after 8 seconds
    setTimeout(() => setAutoPlay(true), 8000)
  }, [isDragging, rotation, anglePerCard])

  // ═══ Button navigation ═══
  const next = () => { setRotation(r => r + anglePerCard); setAutoPlay(false); setTimeout(() => setAutoPlay(true), 8000) }
  const prev = () => { setRotation(r => r - anglePerCard); setAutoPlay(false); setTimeout(() => setAutoPlay(true), 8000) }

  if (!artists || artists.length === 0) return null

  // ═══ Mobile: horizontal scroll ═══
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  if (isMobile) {
    return (
      <div className="relative w-full" dir="rtl">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 px-4 scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
          {artists.map((artist) => (
            <div key={artist.id} className="flex-shrink-0 w-[280px] snap-center">
              <Link href={"/artists/" + artist.slug} className="block group">
                <div className="relative bg-white dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#0a0a0a] rounded-3xl overflow-hidden border-2 border-[#D4AF37]/20 shadow-xl">
                  <div className="relative h-64 overflow-hidden">
                    {artist.coverImage || artist.profileImage ? (
                      <img src={artist.coverImage || artist.profileImage || ""} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#D4AF37]/20 to-[#111] flex items-center justify-center"><Music size={60} className="text-[#D4AF37]/30"/></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                    <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-[#D4AF37] to-[#F4E5B8] rounded-full flex items-center gap-1 shadow-lg"><Award size={10} className="text-[#111]"/><span className="text-[9px] font-black text-[#111]">معتمد</span></div>
                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/80 backdrop-blur-md rounded-full flex items-center gap-1 border border-[#D4AF37]/30"><Star size={12} className="text-[#D4AF37] fill-[#D4AF37]"/><span className="text-xs font-black text-white">{artist.rating||"5.0"}</span></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4"><p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5">{artist.category||"فنان"}</p><h3 className="text-2xl font-black text-white leading-tight drop-shadow-lg">{artist.name}</h3></div>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 min-h-[2.5rem]">{artist.bio||"فنان محترف يقدم أفضل العروض الموسيقية"}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-[#D4AF37]/10">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1"><Calendar size={12} className="text-[#D4AF37]"/><span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">{artist.bookingsCount||0}</span></div>
                        <div className="flex items-center gap-1"><Star size={12} className="text-[#D4AF37]"/><span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">{artist.reviewsCount||0}</span></div>
                      </div>
                      <span className="px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] text-[10px] font-black rounded-full">احجز الآن</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 mt-2 text-gray-400 text-xs"><span>← اسحب للتنقل →</span></div>
      </div>
    )
  }

  // ═══ Desktop: Circular 3D Carousel ═══
  return (
    <div className="relative w-full select-none py-8" dir="rtl">
      {/* Container with perspective */}
      <div
        ref={containerRef}
        className="relative h-[600px] md:h-[700px] flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ perspective: "1200px", overflow: "visible" }}
        onMouseDown={(e) => onStart(e.clientX)}
        onMouseMove={(e) => { e.preventDefault(); onMove(e.clientX) }}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={onEnd}
      >
        {/* Rotating ring */}
        <div
          className="relative w-0 h-0"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${rotation}deg)`,
            transition: isDragging ? "none" : "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          {artists.map((artist, index) => {
            const cardAngle = index * anglePerCard
            // حساب الزاوية النسبية للكاميرا
            const relativeAngle = ((cardAngle + rotation) % 360 + 360) % 360
            // البطاقة الأمامية هي التي زاويتها قريبة من 0 أو 360
            const isFront = relativeAngle < anglePerCard / 2 || relativeAngle > 360 - anglePerCard / 2
            // شفافية بناءً على الزاوية — البطاقات الخلفية أكثر شفافية
            const normalizedAngle = Math.min(relativeAngle, 360 - relativeAngle)
            const opacity = Math.max(0.3, 1 - normalizedAngle / 180)
            const scale = Math.max(0.6, 1 - normalizedAngle / 360)

            return (
              <div
                key={artist.id}
                className="absolute"
                style={{
                  transform: `rotateY(${cardAngle}deg) translateZ(${radius}px)`,
                  transformStyle: "preserve-3d",
                  width: "320px",
                  marginLeft: "-160px",
                }}
              >
                <div
                  className="transition-all duration-300"
                  style={{
                    opacity,
                    transform: `scale(${scale})`,
                    pointerEvents: isFront ? "auto" : "none",
                    filter: isFront ? "none" : "brightness(0.6)",
                  }}
                >
                  <Link href={"/artists/" + artist.slug} className="block group" draggable={false}>
                    <div className="relative bg-white dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#0a0a0a] rounded-3xl overflow-hidden border-2 border-[#D4AF37]/20 shadow-2xl hover:shadow-[#D4AF37]/40 transition-all duration-500 hover:border-[#D4AF37]/50">
                      {/* صورة الفنان */}
                      <div className="relative h-72 md:h-80 overflow-hidden">
                        {artist.coverImage || artist.profileImage ? (
                          <img src={artist.coverImage || artist.profileImage || ""} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" draggable={false}/>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#D4AF37]/20 to-[#111] flex items-center justify-center"><Music size={80} className="text-[#D4AF37]/30"/></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#F4E5B8] rounded-full flex items-center gap-1.5 shadow-lg"><Award size={12} className="text-[#111]"/><span className="text-[10px] font-black text-[#111] uppercase tracking-wider">معتمد</span></div>
                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-full flex items-center gap-1.5 border border-[#D4AF37]/30"><Star size={14} className="text-[#D4AF37] fill-[#D4AF37]"/><span className="text-sm font-black text-white">{artist.rating||"5.0"}</span></div>
                        {isFront && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center shadow-2xl shadow-[#D4AF37]/50"><Play size={24} className="text-[#111] ml-1" fill="#111"/></div>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em] mb-1">{artist.category||"فنان"}</p>
                          <h3 className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-lg">{artist.name}</h3>
                        </div>
                      </div>
                      {/* التفاصيل */}
                      <div className="p-5 space-y-3 bg-white dark:bg-[#111]">
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 min-h-[2.5rem]">{artist.bio||"فنان محترف يقدم أفضل العروض الموسيقية"}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-[#D4AF37]/10">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1"><Calendar size={13} className="text-[#D4AF37]"/><span className="text-xs font-bold text-gray-600 dark:text-gray-400">{artist.bookingsCount||0} حجز</span></div>
                            <div className="flex items-center gap-1"><Star size={13} className="text-[#D4AF37]"/><span className="text-xs font-bold text-gray-600 dark:text-gray-400">{artist.reviewsCount||0} تقييم</span></div>
                          </div>
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] text-xs font-black rounded-full">احجز الآن</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* أزرار التنقل */}
      <button onClick={prev} className="absolute top-1/2 -translate-y-1/2 right-4 md:right-8 w-12 h-12 rounded-full bg-[#111] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#111] transition-all z-40 shadow-lg"><ChevronRight size={24}/></button>
      <button onClick={next} className="absolute top-1/2 -translate-y-1/2 left-4 md:left-8 w-12 h-12 rounded-full bg-[#111] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#111] transition-all z-40 shadow-lg"><ChevronLeft size={24}/></button>

      {/* مؤشر التشغيل التلقائي */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button onClick={() => setAutoPlay(!autoPlay)} className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-[#D4AF37]/20 rounded-full text-xs font-bold text-gray-400 hover:text-[#D4AF37] transition">
          <span className={"w-2 h-2 rounded-full transition-colors " + (autoPlay ? "bg-[#D4AF37]" : "bg-gray-600")}></span>
          {autoPlay ? "تلقائي" : "متوقف"}
        </button>
        <span className="text-xs text-gray-500">اسحب أو استخدم الأسهم للتنقل</span>
      </div>
    </div>
  )
}