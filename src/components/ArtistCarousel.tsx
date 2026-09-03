"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Star, Calendar, Music, ChevronRight, ChevronLeft, Award } from "lucide-react"

interface Artist {
  id: string
  name: string
  slug: string
  category: string | null
  bio: string | null
  profileImage: string | null
  rating?: number
  reviewsCount?: number
  bookingsCount?: number
}

export default function ArtistCarousel({ artists }: { artists: Artist[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [maxIndex, setMaxIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  useEffect(() => {
    const updateMaxIndex = () => {
      if (scrollRef.current) {
        const { scrollWidth, clientWidth } = scrollRef.current
        const cardWidth = 320 + 24 // عرض البطاقة + الفجوة
        const visibleCards = Math.floor(clientWidth / cardWidth)
        setMaxIndex(Math.max(0, artists.length - visibleCards))
      }
    }
    updateMaxIndex()
    window.addEventListener("resize", updateMaxIndex)
    return () => window.removeEventListener("resize", updateMaxIndex)
  }, [artists.length])

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = 320 + 24
      const targetScroll = index * cardWidth
      scrollRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth"
      })
      setCurrentIndex(index)
    }
  }

  const handleScroll = () => {
    if (scrollRef.current) {
      const cardWidth = 320 + 24
      const index = Math.round(scrollRef.current.scrollLeft / cardWidth)
      setCurrentIndex(Math.min(index, maxIndex))
    }
  }

  // السحب باللمس / الماوس
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0))
    setScrollLeft(scrollRef.current?.scrollLeft || 0)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0)
    const walk = (x - startX) * 1.5
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    handleScroll()
  }

  if (artists.length === 0) return null

  return (
    <div className="relative">
      {/* أزرار التنقل */}
      <button
        onClick={() => scrollToIndex(Math.max(0, currentIndex - 1))}
        disabled={currentIndex === 0}
        className={`absolute -right-16 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#b8941f] text-[#111] flex items-center justify-center shadow-lg transition-all duration-300 ${
          currentIndex === 0 
            ? "opacity-30 cursor-not-allowed" 
            : "hover:scale-110 hover:shadow-xl hover:shadow-[#D4AF37]/30"
        }`}
        aria-label="السابق"
      >
        <ChevronRight size={24} />
      </button>

      <button
        onClick={() => scrollToIndex(Math.min(maxIndex, currentIndex + 1))}
        disabled={currentIndex >= maxIndex}
        className={`absolute -left-16 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#b8941f] text-[#111] flex items-center justify-center shadow-lg transition-all duration-300 ${
          currentIndex >= maxIndex 
            ? "opacity-30 cursor-not-allowed" 
            : "hover:scale-110 hover:shadow-xl hover:shadow-[#D4AF37]/30"
        }`}
        aria-label="التالي"
      >
        <ChevronLeft size={24} />
      </button>

      {/* الحاوية القابلة للتمرير */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex gap-6 overflow-x-hidden pb-4 scroll-smooth ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ scrollBehavior: "smooth" }}
      >
        {artists.map((artist) => (
          <Link
            key={artist.id}
            href={`/artists/${artist.slug}`}
            className="group flex-shrink-0 w-[320px] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-[#D4AF37]/20 transition-all duration-500 hover:-translate-y-2"
          >
            {/* صورة الفنان */}
            <div className="relative h-64 bg-gradient-to-br from-[#111] to-[#333] overflow-hidden">
              {artist.profileImage ? (
                <img
                  src={artist.profileImage}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music size={64} className="text-[#D4AF37]/30" />
                </div>
              )}
              
              {/* تأثير التدرج */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              
              {/* شارة التقييم */}
              <div className="absolute top-4 right-4 px-3 py-1.5 bg-[#111]/80 backdrop-blur-sm rounded-full flex items-center gap-1.5 border border-[#D4AF37]/30">
                <Star size={14} className="text-[#D4AF37] fill-[#D4AF37]" />
                <span className="text-sm font-black text-white">
                  {artist.rating || "5.0"}
                </span>
              </div>

              {/* شارة معتمد */}
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#F4E5B8] rounded-full flex items-center gap-1.5">
                <Award size={12} className="text-[#111]" />
                <span className="text-xs font-black text-[#111]">معتمد</span>
              </div>

              {/* معلومات فوق الصورة */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-[#D4AF37] text-xs font-bold mb-1 uppercase tracking-wider">
                  {artist.category || "فنان"}
                </p>
                <h3 className="text-2xl font-black text-white leading-tight">
                  {artist.name}
                </h3>
              </div>
            </div>

            {/* التفاصيل */}
            <div className="p-5">
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-4">
                {artist.bio || "فنان محترف يقدم أفضل العروض"}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={16} className="text-[#D4AF37]" />
                    <span className="text-xs font-bold text-gray-600">
                      {artist.bookingsCount || 0} حجز
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star size={16} className="text-[#D4AF37]" />
                    <span className="text-xs font-bold text-gray-600">
                      {artist.reviewsCount || 0} تقييم
                    </span>
                  </div>
                </div>
                <span className="text-sm font-black text-[#D4AF37] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  احجز الآن
                  <ChevronLeft size={16} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* مؤشرات النقاط */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? "w-8 bg-gradient-to-r from-[#D4AF37] to-[#b8941f]"
                : "w-2 bg-gray-300 hover:bg-[#D4AF37]/50"
            }`}
            aria-label={`الانتقال إلى ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}