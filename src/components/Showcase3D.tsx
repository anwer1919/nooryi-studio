"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const SLIDES = [
  { src: "/images/showcase-guitar.png", title: "عزف حي يلامس الروح", sub: "جيتارات نخبة لصوت لا يُنسى" },
  { src: "/images/showcase-amps.png", title: "قوة صوت نقية", sub: "أنظمة مضخمة تملأ المكان دون تشويش" },
  { src: "/images/showcase-drums.png", title: "إيقاع وغناء", sub: "من الدرامز إلى الميكروفون — فرقة كاملة" },
  { src: "/images/showcase-notes.png", title: "أجواء متواصلة", sub: "موسيقى تبقي الطاقة عالية حتى آخر الليلة" },
];

export default function Showcase3D() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const iv = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 4500);
    return () => clearInterval(iv);
  }, [paused]);

  const next = () => setIndex((i) => (i + 1) % SLIDES.length);
  const prev = () => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);

  return (
    <section
      dir="rtl"
      className="relative py-14 md:py-24 overflow-hidden bg-gradient-to-b from-white via-[#faf8f0] to-white dark:from-[#0a0a0a] dark:via-[#101010] dark:to-[#0a0a0a]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* توهج خلفي */}
      <div className="absolute top-10 right-1/4 w-72 h-72 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/4 w-72 h-72 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* العنوان */}
        <div className="text-center mb-10 md:mb-14">
          <span className="badge-gold"><Sparkles size={14} /> تجربة Nooryi البصرية</span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mt-4">
            عالمنا <span className="gold-text">بالصورة والصوت</span>
          </h2>
          <p className="text-gray-500 dark:text-white/60 mt-3 max-w-xl mx-auto text-sm md:text-base">
            جولة ثلاثية الأبعاد بين آلاتنا ومعداتنا — كل صورة تحكي جزءاً من حفل ناجح
          </p>
        </div>

        {/* الكاروسيل ثلاثي الأبعاد */}
        <div className="relative" style={{ perspective: "1400px" }}>
          <div className="relative h-[240px] sm:h-[320px] md:h-[400px] lg:h-[460px] mx-auto max-w-5xl" style={{ transformStyle: "preserve-3d" }}>
            {SLIDES.map((s, i) => {
              const angle = (i - index) * 90;
              return (
                <div
                  key={i}
                  className="absolute inset-x-4 sm:inset-x-10 md:inset-x-16 top-0 bottom-0 rounded-3xl overflow-hidden border border-[#d4af37]/30 shadow-2xl shadow-[#d4af37]/10 transition-transform duration-[900ms]"
                  style={{
                    transform: `rotateY(${angle}deg) translateZ(clamp(170px, 32vw, 400px))`,
                    backfaceVisibility: "hidden",
                    transitionTimingFunction: "cubic-bezier(.22,.61,.36,1)",
                  }}
                >
                  <img src={s.src} alt={s.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 right-0 left-0 p-5 md:p-8">
                    <span className="inline-block text-[10px] font-bold px-3 py-1 rounded-full bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 mb-2">
                      Nooryi Showcase
                    </span>
                    <h3 className="text-xl md:text-3xl font-black text-white">{s.title}</h3>
                    <p className="text-white/70 text-xs md:text-sm mt-1">{s.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* أسهم التنقل */}
          <button onClick={prev} aria-label="السابق" className="absolute right-0 md:-right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 dark:bg-[#1a1a1a]/90 border border-[#d4af37]/40 text-[#b8941f] hover:bg-[#d4af37] hover:text-[#111] transition-all flex items-center justify-center shadow-lg">
            <ChevronRight size={20} />
          </button>
          <button onClick={next} aria-label="التالي" className="absolute left-0 md:-left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 dark:bg-[#1a1a1a]/90 border border-[#d4af37]/40 text-[#b8941f] hover:bg-[#d4af37] hover:text-[#111] transition-all flex items-center justify-center shadow-lg">
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* النقاط */}
        <div className="flex justify-center gap-2 mt-8">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`شريحة ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${i === index ? "w-8 bg-[#d4af37]" : "w-2 bg-gray-300 dark:bg-white/20 hover:bg-[#d4af37]/50"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}