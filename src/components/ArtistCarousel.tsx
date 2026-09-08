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
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const autoRef = useRef<NodeJS.Timeout | null>(null)
  const total = artists.length

  useEffect(() => {
    if (autoPlay && total > 1) {
      autoRef.current = setInterval(() => setActiveIndex(i => (i + 1) % total), 4500)
    }
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
  }, [autoPlay, total])

  const onStart = useCallback((x: number) => {
    setIsDragging(true); setDragStartX(x); setAutoPlay(false)
    if (autoRef.current) clearInterval(autoRef.current)
  }, [])

  const onEnd = useCallback((x: number) => {
    if (!isDragging) return
    setIsDragging(false)
    const diff = x - dragStartX
    if (diff > 50) setActiveIndex(i => (i - 1 + total) % total)
    else if (diff < -50) setActiveIndex(i => (i + 1) % total)
    setTimeout(() => setAutoPlay(true), 8000)
  }, [isDragging, dragStartX, total])

  const next = () => { setActiveIndex(i => (i + 1) % total); setAutoPlay(false); setTimeout(() => setAutoPlay(true), 8000) }
  const prev = () => { setActiveIndex(i => (i - 1 + total) % total); setAutoPlay(false); setTimeout(() => setAutoPlay(true), 8000) }

  if (!artists || total === 0) return null

  const getCardStyle = (index: number) => {
    let offset = index - activeIndex
    if (offset > total / 2) offset -= total
    if (offset < -total / 2) offset += total
    const abs = Math.abs(offset)

    if (abs === 0) return { transform: "translateX(0) translateY(0) scale(1)", opacity: 1, zIndex: 30, pe: "auto" as const, filter: "none", blur: "" }
    if (abs === 1) { const d = offset > 0 ? 1 : -1; return { transform: `translateX(${d * 260}px) translateY(70px) scale(0.82)`, opacity: 0.75, zIndex: 20, pe: "none" as const, filter: "brightness(0.55)", blur: "" } }
    if (abs === 2) { const d = offset > 0 ? 1 : -1; return { transform: `translateX(${d * 440}px) translateY(120px) scale(0.68)`, opacity: 0.4, zIndex: 10, pe: "none" as const, filter: "brightness(0.35)", blur: "blur(1px)" } }
    return { transform: "scale(0.5)", opacity: 0, zIndex: 0, pe: "none" as const, filter: "none", blur: "" }
  }

  return (
    <div className="relative w-full select-none py-4 md:py-8 overflow-hidden">
      {/* Container — overflow hidden لمنع السكرول */}
      <div
        className="relative h-[480px] md:h-[580px] flex items-start justify-center"
        style={{ perspective: "1200px" }}
        onMouseDown={e => onStart(e.clientX)}
        onMouseUp={e => onEnd(e.clientX)}
        onMouseLeave={() => { if (isDragging) setIsDragging(false) }}
        onTouchStart={e => { e.preventDefault(); onStart(e.touches[0].clientX) }}
        onTouchMove={e => e.preventDefault()}
        onTouchEnd={e => onEnd(e.changedTouches[0].clientX)}
      >
        {artists.map((artist, index) => {
          const s = getCardStyle(index)
          const isActive = index === activeIndex
          return (
            <div key={artist.id} className="absolute w-[260px] md:w-[340px] transition-all duration-600 ease-out" style={{ transform: s.transform, opacity: s.opacity, zIndex: s.zIndex, filter: s.filter + " " + s.blur, pointerEvents: s.pe, top: "10px" }}>
              <Link href={"/artists/" + artist.slug} className="block group" draggable={false}>
                <div className={`relative rounded-2xl md:rounded-3xl overflow-hidden border-2 shadow-2xl transition-all duration-500 ${isActive ? "border-[#D4AF37]/50 shadow-[#D4AF37]/20" : "border-white/10"} bg-[#111]`}>
                  <div className={`relative overflow-hidden ${isActive ? "h-56 md:h-72" : "h-44 md:h-52"}`}>
                    {artist.coverImage || artist.profileImage ? (
                      <img src={artist.coverImage || artist.profileImage || ""} alt={artist.name} className="w-full h-full object-cover" draggable={false} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#D4AF37]/20 to-[#111] flex items-center justify-center"><Music size={50} className="text-[#D4AF37]/30" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    <div className="absolute top-3 right-3 px-2 py-0.5 bg-gradient-to-r from-[#D4AF37] to-[#F4E5B8] rounded-full flex items-center gap-1 shadow-lg">
                      <Award size={9} className="text-[#0a0a0a]" /><span className="text-[8px] font-black text-[#0a0a0a] uppercase">معتمد</span>
                    </div>
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/80 backdrop-blur-sm rounded-full flex items-center gap-1 border border-[#D4AF37]/30">
                      <Star size={10} className="text-[#D4AF37] fill-[#D4AF37]" /><span className="text-[10px] font-black text-white">{artist.rating || "5.0"}</span>
                    </div>
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center shadow-2xl shadow-[#D4AF37]/50">
                          <Play size={20} className="text-[#0a0a0a] ml-0.5" fill="#0a0a0a" />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                      <p className="text-[#D4AF37] text-[9px] font-bold uppercase tracking-[0.2em] mb-0.5">{artist.category || "فنان"}</p>
                      <h3 className={`font-black text-white leading-tight drop-shadow-lg ${isActive ? "text-xl md:text-2xl" : "text-lg"}`}>{artist.name}</h3>
                    </div>
                  </div>
                  {isActive && (
                    <div className="p-4 space-y-2.5 bg-[#111]">
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 min-h-[2rem]">{artist.bio || "فنان محترف يقدم أفضل العروض الموسيقية"}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-[#D4AF37]/10">
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center gap-1"><Calendar size={11} className="text-[#D4AF37]" /><span className="text-[10px] font-bold text-gray-400">{artist.bookingsCount || 0}</span></div>
                          <div className="flex items-center gap-1"><Star size={11} className="text-[#D4AF37]" /><span className="text-[10px] font-bold text-gray-400">{artist.reviewsCount || 0}</span></div>
                        </div>
                        <span className="px-2.5 py-1 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#0a0a0a] text-[10px] font-black rounded-full">احجز الآن</span>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          )
        })}
      </div>

      {/* أزرار */}
      <button onClick={prev} className="absolute top-1/2 -translate-y-1/2 right-1 md:right-4 w-10 h-10 md:w-11 md:h-11 rounded-full bg-[#111]/90 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#0a0a0a] transition-all z-40 shadow-lg backdrop-blur-sm"><ChevronRight size={20} /></button>
      <button onClick={next} className="absolute top-1/2 -translate-y-1/2 left-1 md:left-4 w-10 h-10 md:w-11 md:h-11 rounded-full bg-[#111]/90 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#0a0a0a] transition-all z-40 shadow-lg backdrop-blur-sm"><ChevronLeft size={20} /></button>

      {/* نقاط */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {artists.map((_, i) => (
          <button key={i} onClick={() => { setActiveIndex(i); setAutoPlay(false); setTimeout(() => setAutoPlay(true), 8000) }}
            className={`rounded-full transition-all duration-300 ${i === activeIndex ? "w-6 h-2 bg-[#D4AF37]" : "w-2 h-2 bg-gray-600 hover:bg-gray-400"}`} />
        ))}
      </div>
    </div>
  )
}