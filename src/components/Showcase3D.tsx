"use client";
import { Sparkles } from "lucide-react";

export default function Showcase3D() {
  return (
    <section dir="rtl" className="relative py-14 md:py-24 overflow-hidden bg-gradient-to-b from-white via-[#faf8f0] to-white dark:from-[#0a0a0a] dark:via-[#101010] dark:to-[#0a0a0a]">
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
        </div>

        {/* صورة النوتات الثابتة */}
        <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden border border-[#d4af37]/30 shadow-2xl shadow-[#d4af37]/10">
          <img
            src="/images/showcase-notes.png"
            alt="أجواء متواصلة — Nooryi Studio"
            className="w-full h-[260px] sm:h-[340px] md:h-[420px] lg:h-[480px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
          <div className="absolute bottom-0 right-0 left-0 p-5 md:p-8">
            <span className="inline-block text-[10px] font-bold px-3 py-1 rounded-full bg-[#d4af37]/20 backdrop-blur-sm text-[#d4af37] border border-[#d4af37]/40 mb-2">
              Nooryi Showcase
            </span>
            <h3 className="text-xl md:text-3xl font-black text-white">أجواء متواصلة</h3>
            <p className="text-white/70 text-xs md:text-sm mt-1">موسيقى تبقي الطاقة عالية حتى آخر الليلة</p>
          </div>
        </div>
      </div>
    </section>
  );
}