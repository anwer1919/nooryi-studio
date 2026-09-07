"use client";
import { Music, Volume2, Mic, Disc3 } from "lucide-react";

const ITEMS = [
  { img: "/images/showcase-guitar.jpg", icon: Music, tag: "الأكثر حجزاً", title: "جيتاريستات النخبة", desc: "أوتار تلامس الروح — عزف حي يرفع مستوى مناسبتك" },
  { img: "/images/showcase-amps.jpg", icon: Volume2, tag: "صوتيات", title: "أنظمة صوت احترافية", desc: "قوة صوت نقية تملأ المكان دون تشويش" },
  { img: "/images/showcase-drums.jpg", icon: Mic, tag: "فرق كاملة", title: "إيقاع وغناء", desc: "من الدرامز إلى الميكروفون — حفل لا يُنسى" },
  { img: "/images/showcase-notes.jpg", icon: Disc3, tag: "أجواء", title: "دي جي وموسيقى", desc: "خلطات تبقي الطاقة عالية حتى آخر الليلة" },
];

export default function EliteVisuals() {
  return (
    <section dir="rtl" className="py-14 md:py-20 bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="badge-gold">تجربة متكاملة</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mt-4">
            كل ما يحتاجه <span className="gold-text">حفلك الناجح</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6" style={{ perspective: "1200px" }}>
          {ITEMS.map((item, i) => (
            <div
              key={i}
              className="group relative rounded-3xl overflow-hidden bg-[#111] border border-[#d4af37]/20 shadow-xl transition-transform duration-500 hover:[transform:rotateY(-6deg)_rotateX(4deg)_scale(1.03)] hover:shadow-2xl hover:shadow-[#d4af37]/20"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative h-56 md:h-64 overflow-hidden">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/30 to-transparent"></div>
                <span className="absolute top-4 right-4 text-[10px] font-bold px-3 py-1 rounded-full bg-[#d4af37]/20 backdrop-blur-sm text-[#d4af37] border border-[#d4af37]/40">
                  {item.tag}
                </span>
              </div>
              <div className="p-5 -mt-10 relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#b8941f] flex items-center justify-center shadow-lg shadow-[#d4af37]/30 mb-3">
                  <item.icon size={22} className="text-[#111]" />
                </div>
                <h3 className="text-lg font-black gold-text">{item.title}</h3>
                <p className="text-white/60 text-sm mt-1.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}