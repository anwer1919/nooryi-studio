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

  // Auto-play
  useEffect(() => {
    if (autoPlay && total > 1) {
      autoRef.current = setInterval(() => setActiveIndex(i => (i + 1) % total), 4000)
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

  // حساب موقع كل بطاقة بالنسبة للبطاقة النشطة
  const getCardStyle = (index: number) => {
    let offset = index - activeIndex
    // التعامل مع الالتفاف
    if (offset > total / 2) offset -= total
    if (offset < -total / 2) offset += total

    const absOffset = Math.abs(offset)

    if (absOffset === 0) {
      // البطاقة النشطة: المنتصف، كبيرة، في الأعلى
      return { transform: "translateX(0) translateY(0) scale(1)", opacity: 1, zIndex: 30, pointerEvents: "auto" as const, filter: "none" }
    } else if (absOffset === 1) {
      // البطاقات المجاورة: أسفل يمين/يسار، أصغر
      const dir = offset > 0 ? 1 : -1
      return {
        transform: `translateX(${dir * 280}px) translateY(80px) scale(0.8)`,
        opacity: 0.7, zIndex: 20, pointerEvents: "none" as const, filter: "brightness(0.6)"
      }
    } else if (absOffset === 2) {
      // البطاقات الأبعد: أكثر انخفاضاً وأصغر
      const dir = offset > 0 ? 1 : -1
      return {
        transform: `translateX(${dir * 480}px) translateY(140px) scale(0.65)`,
        opacity: 0.4, zIndex: 10, pointerEvents: "none" as const, filter: "brightness(0.4)"
      }
    } else {
      // الباقي: مخفية
      return { transform: "translateX(0) translateY(200px) scale(0.5)", opacity: 0, zIndex: 0, pointerEvents: "none" as const, filter: "none" }
    }
  }

  return (
    <div className="relative w-full select-none py-6 md:py-10" dir="rtl">
      {/* Container */}
      <div
        className="relative h-[520px] md:h-[620px] flex items-start justify-center overflow-visible"
        style={{ perspective: "1200px" }}
        onMouseDown={e => onStart(e.clientX)}
        onMouseUp={e => onEnd(e.clientX)}
        onMouseLeave={() => { if (isDragging) setIsDragging(false) }}
        onTouchStart={e => onStart(e.touches[0].clientX)}
        onTouchEnd={e => onEnd(e.changedTouches[0].clientX)}
      >
        {artists.map((artist, index) => {
          const style = getCardStyle(index)
          const isActive = index === activeIndex

          return (
            <div
              key={artist.id}
              className="absolute w-[280px] md:w-[360px] transition-all duration-500 ease-out"
              style={{
                transform: style.transform,
                opacity: style.opacity,
                zIndex: style.zIndex,
                filter: style.filter,
                pointerEvents: style.pointerEvents,
                top: "20px",
              }}
            >
              <Link href={"/artists/" + artist.slug} className="block group" draggable={false}>
                <div className={`relative rounded-3xl overflow-hidden border-2 shadow-2xl transition-all duration-500 ${isActive ? "border-[#D4AF37]/50 shadow-[#D4AF37]/20 bg-[#111]" : "border-[#D4AF37]/10 bg-[#111]"}`}>
                  {/* الصورة */}
                  <div className={`relative overflow-hidden ${isActive ? "h-64 md:h-80" : "h-48 md:h-56"}`}>
                    {artist.coverImage || artist.profileImage ? (
                      <img src={artist.coverImage || artist.profileImage || ""} alt={artist.name} className="w-full h-full object-cover" draggable={false} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#D4AF37]/20 to-[#111] flex items-center justify-center"><Music size={60} className="text-[#D4AF37]/30" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-gradient-to-r from-[#D4AF37] to-[#F4E5B8] rounded-full flex items-center gap-1 shadow-lg">
                      <Award size={10} className="text-[#0a0a0a]" /><span className="text-[9px] font-black text-[#0a0a0a] uppercase">معتمد</span>
                    </div>
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/80 backdrop-blur-md rounded-full flex items-center gap-1 border border-[#D4AF37]/30">
                      <Star size={12} className="text-[#D4AF37] fill-[#D4AF37]" /><span className="text-xs font-black text-white">{artist.rating || "5.0"}</span>
                    </div>
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center shadow-2xl shadow-[#D4AF37]/50">
                          <Play size={22} className="text-[#0a0a0a] ml-1" fill="#0a0a0a" />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                      <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{artist.category || "فنان"}</p>
                      <h3 className={`font-black text-white leading-tight drop-shadow-lg ${isActive ? "text-2xl md:text-3xl" : "text-xl"}`}>{artist.name}</h3>
                    </div>
                  </div>
                  {/* التفاصيل — تظهر فقط للبطاقة النشطة */}
                  {isActive && (
                    <div className="p-5 space-y-3 bg-[#111]">
                      <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 min-h-[2.5rem]">{artist.bio || "فنان محترف يقدم أفضل العروض الموسيقية"}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-[#D4AF37]/10">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1"><Calendar size={13} className="text-[#D4AF37]" /><span className="text-xs font-bold text-gray-400">{artist.bookingsCount || 0} حجز</span></div>
                          <div className="flex items-center gap-1"><Star size={13} className="text-[#D4AF37]" /><span className="text-xs font-bold text-gray-400">{artist.reviewsCount || 0} تقييم</span></div>
                        </div>
                        <span className="px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#0a0a0a] text-xs font-black rounded-full">احجز الآن</span>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          )
        })}
      </div>

      {/* أزرار التنقل */}
      <button onClick={prev} className="absolute top-1/2 -translate-y-1/2 right-2 md:right-6 w-11 h-11 rounded-full bg-[#111] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#0a0a0a] transition-all z-40 shadow-lg"><ChevronRight size={22} /></button>
      <button onClick={next} className="absolute top-1/2 -translate-y-1/2 left-2 md:left-6 w-11 h-11 rounded-full bg-[#111] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#0a0a0a] transition-all z-40 shadow-lg"><ChevronLeft size={22} /></button>

      {/* نقاط التنقل */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {artists.map((_, i) => (
          <button key={i} onClick={() => { setActiveIndex(i); setAutoPlay(false); setTimeout(() => setAutoPlay(true), 8000) }}
            className={`rounded-full transition-all duration-300 ${i === activeIndex ? "w-8 h-2.5 bg-[#D4AF37]" : "w-2.5 h-2.5 bg-gray-600 hover:bg-gray-400"}`} />
        ))}
      </div>

      {/* مؤشر التشغيل التلقائي */}
      <div className="flex items-center justify-center mt-3">
        <button onClick={() => setAutoPlay(!autoPlay)} className="flex items-center gap-2 px-3 py-1 bg-[#111] border border-[#D4AF37]/20 rounded-full text-[10px] font-bold text-gray-400 hover:text-[#D4AF37] transition">
          <span className={`w-1.5 h-1.5 rounded-full transition-colors ${autoPlay ? "bg-[#D4AF37]" : "bg-gray-600"}`} />
          {autoPlay ? "تلقائي" : "متوقف"}
        </button>
      </div>
    </div>
  )
}