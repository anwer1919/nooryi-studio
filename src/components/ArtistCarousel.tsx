"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { Star, Calendar, Music, Award, Play, ChevronLeft, ChevronRight } from "lucide-react"

interface Artist {
  id: string; name: string; slug: string; category: string | null
  bio: string | null; profileImage: string | null; coverImage?: string | null
  rating?: number; reviewsCount?: number; bookingsCount?: number
}

export default function ArtistCarousel({ artists }: { artists: Artist[] }) {
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartRotation, setDragStartRotation] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  const total = artists.length
  const angleStep = 360 / total
  const radius = Math.max(260, total * 42)

  // Auto-play
  useEffect(() => {
    if (autoPlay && total > 1) {
      autoPlayRef.current = setInterval(() => setRotation(r => r + angleStep), 4000)
    }
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current) }
  }, [autoPlay, angleStep, total])

  // Drag — preventDefault على touchmove لمنع سكرول الصفحة
  const onStart = useCallback((clientX: number) => {
    setIsDragging(true)
    setDragStartX(clientX)
    setDragStartRotation(rotation)
    setAutoPlay(false)
    if (autoPlayRef.current) clearInterval(autoPlayRef.current)
  }, [rotation])

  const onMove = useCallback((clientX: number) => {
    if (!isDragging) return
    const diff = clientX - dragStartX
    setRotation(dragStartRotation - diff * 0.5)
  }, [isDragging, dragStartX, dragStartRotation])

  const onEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    const snapped = Math.round(rotation / angleStep) * angleStep
    setRotation(snapped)
    setTimeout(() => setAutoPlay(true), 8000)
  }, [isDragging, rotation, angleStep])

  const next = () => { setRotation(r => r + angleStep); setAutoPlay(false); setTimeout(() => setAutoPlay(true), 8000) }
  const prev = () => { setRotation(r => r - angleStep); setAutoPlay(false); setTimeout(() => setAutoPlay(true), 8000) }

  if (!artists || total === 0) return null

  // ═══ Mobile: horizontal scroll with overflow-hidden on container ═══
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  if (isMobile) {
    return (
      <div className="relative w-full overflow-hidden" dir="rtl">
        <div
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 px-4"
          style={{ WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain" }}
          onTouchMove={(e) => e.stopPropagation()}
        >
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

  // ═══ Desktop: Top-center 3D arc ═══
  // البطاقة النشطة في الأعلى، اليمين واليسار أسفل منها
  return (
    <div className="relative w-full select-none py-4" dir="rtl">
      <div
        className="relative h-[580px] md:h-[650px] flex items-start justify-center overflow-visible"
        style={{ perspective: "1200px" }}
        onMouseDown={(e) => onStart(e.clientX)}
        onMouseMove={(e) => { e.preventDefault(); onMove(e.clientX) }}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        onTouchStart={(e) => { e.preventDefault(); onStart(e.touches[0].clientX) }}
        onTouchMove={(e) => { e.preventDefault(); e.stopPropagation(); onMove(e.touches[0].clientX) }}
        onTouchEnd={onEnd}
      >
        {/* الحلقة الدوارة — مركزها في الأعلى */}
        <div
          className="relative w-0 h-0"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(-15deg) rotateY(${rotation}deg)`,
            transition: isDragging ? "none" : "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            marginTop: "60px",
          }}
        >
          {artists.map((artist, index) => {
            const cardAngle = index * angleStep
            // الزاوية النسبية بعد الدوران
            const rel = ((cardAngle + rotation) % 360 + 360) % 360
            const dist = Math.min(rel, 360 - rel)
            // البطاقة الأمامية (في الأعلى): dist ≈ 0
            const isFront = dist < angleStep / 2
            const opacity = Math.max(0.25, 1 - dist / 160)
            const scale = Math.max(0.55, 1 - dist / 300)
            // البطاقات الجانبية تنزل لأسفل
            const translateY = dist * 1.2

            return (
              <div
                key={artist.id}
                className="absolute"
                style={{
                  transform: `rotateY(${cardAngle}deg) translateZ(${radius}px)`,
                  transformStyle: "preserve-3d",
                  width: "300px",
                  marginLeft: "-150px",
                }}
              >
                <div
                  className="transition-all duration-300"
                  style={{
                    opacity,
                    transform: `scale(${scale}) translateY(${translateY}px)`,
                    pointerEvents: isFront ? "auto" : "none",
                    filter: isFront ? "none" : `brightness(${Math.max(0.4, 1 - dist / 200)})`,
                    zIndex: Math.round(100 - dist),
                  }}
                >
                  <Link href={"/artists/" + artist.slug} className="block group" draggable={false}>
                    <div className={`relative bg-white dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#0a0a0a] rounded-3xl overflow-hidden border-2 shadow-2xl transition-all duration-500 ${isFront ? "border-[#D4AF37]/50 shadow-[#D4AF37]/20" : "border-[#D4AF37]/10"}`}>
                      <div className="relative h-64 md:h-72 overflow-hidden">
                        {artist.coverImage || artist.profileImage ? (
                          <img src={artist.coverImage || artist.profileImage || ""} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" draggable={false}/>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#D4AF37]/20 to-[#111] flex items-center justify-center"><Music size={70} className="text-[#D4AF37]/30"/></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-gradient-to-r from-[#D4AF37] to-[#F4E5B8] rounded-full flex items-center gap-1 shadow-lg"><Award size={10} className="text-[#111]"/><span className="text-[9px] font-black text-[#111] uppercase">معتمد</span></div>
                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/80 backdrop-blur-md rounded-full flex items-center gap-1 border border-[#D4AF37]/30"><Star size={12} className="text-[#D4AF37] fill-[#D4AF37]"/><span className="text-xs font-black text-white">{artist.rating||"5.0"}</span></div>
                        {isFront && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center shadow-2xl shadow-[#D4AF37]/50"><Play size={22} className="text-[#111] ml-1" fill="#111"/></div>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{artist.category||"فنان"}</p>
                          <h3 className="text-2xl font-black text-white leading-tight drop-shadow-lg">{artist.name}</h3>
                        </div>
                      </div>
                      <div className="p-4 space-y-2 bg-white dark:bg-[#111]">
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 min-h-[2rem]">{artist.bio||"فنان محترف يقدم أفضل العروض الموسيقية"}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-[#D4AF37]/10">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1"><Calendar size={11} className="text-[#D4AF37]"/><span className="text-[10px] font-bold text-gray-500">{artist.bookingsCount||0}</span></div>
                            <div className="flex items-center gap-1"><Star size={11} className="text-[#D4AF37]"/><span className="text-[10px] font-bold text-gray-500">{artist.reviewsCount||0}</span></div>
                          </div>
                          <span className="px-3 py-1 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#111] text-[10px] font-black rounded-full">احجز الآن</span>
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

      {/* أزرار */}
      <button onClick={prev} className="absolute top-1/2 -translate-y-1/2 right-2 md:right-6 w-11 h-11 rounded-full bg-[#111] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#111] transition-all z-40 shadow-lg"><ChevronRight size={22}/></button>
      <button onClick={next} className="absolute top-1/2 -translate-y-1/2 left-2 md:left-6 w-11 h-11 rounded-full bg-[#111] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#111] transition-all z-40 shadow-lg"><ChevronLeft size={22}/></button>

      {/* تحكم */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <button onClick={() => setAutoPlay(!autoPlay)} className="flex items-center gap-2 px-4 py-1.5 bg-[#111] border border-[#D4AF37]/20 rounded-full text-xs font-bold text-gray-400 hover:text-[#D4AF37] transition">
          <span className={"w-2 h-2 rounded-full transition-colors " + (autoPlay ? "bg-[#D4AF37]" : "bg-gray-600")}></span>
          {autoPlay ? "تلقائي" : "متوقف"}
        </button>
      </div>
    </div>
  )
}