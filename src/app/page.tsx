"use client"

import Link from "next/link"
import { Music, Star, Sparkles } from "lucide-react"
import FluidBackground from "@/components/LazyFluidBackground"

export default function HomePage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#1a0a04]">
      {/* خلفية السائل */}
      <FluidBackground scrimStrength="strong" />

      {/* المحتوى */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Content */}
        <main className="flex-1 flex items-center justify-center px-6 pt-24 pb-12">
          <div className="max-w-4xl text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/8 border border-white/16 backdrop-blur-xl rounded-full px-4 py-2 mb-8 animate-fade-in">
              <Sparkles size={16} className="text-yellow-400" />
              <span className="text-white/80 text-sm">أكثر من 10K حجز ناجح</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight mb-6 animate-fade-up">
              احجز أفضل الفنانين
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
                لحفلتك الخاصة
              </span>
            </h1>

            {/* Sub-line */}
            <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-up-delay">
              منصة فاخرة لإدارة وحجز حفلات متعددة الفنانين. اختر التاريخ، الفنان، وابدأ تجربتك الاستثنائية.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up-delay-2">
              <Link
                href="/artists"
                className="w-full sm:w-auto bg-white text-black font-bold py-4 px-8 rounded-full hover:bg-white/90 transition shadow-2xl shadow-amber-500/20"
              >
                استكشف الفنانين ←
              </Link>
              <Link
                href="/my-bookings"
                className="w-full sm:w-auto bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold py-4 px-8 rounded-full hover:bg-white/20 transition"
              >
                عرض حجوزاتي
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto animate-fade-up-delay-3">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">50+</div>
                <div className="text-white/60 text-sm">فنان محترف</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">10K+</div>
                <div className="text-white/60 text-sm">حجز ناجح</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1 flex items-center justify-center gap-2">
                  4.9
                  <Star size={24} className="fill-yellow-400 text-yellow-400" />
                </div>
                <div className="text-white/60 text-sm">تقييم</div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(26px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(0.2, 0, 0, 1) 0.3s both;
        }
        .animate-fade-up {
          animation: fade-up 0.8s cubic-bezier(0.2, 0, 0, 1) 0.5s both;
        }
        .animate-fade-up-delay {
          animation: fade-up 0.8s cubic-bezier(0.2, 0, 0, 1) 0.8s both;
        }
        .animate-fade-up-delay-2 {
          animation: fade-up 0.8s cubic-bezier(0.2, 0, 0, 1) 1.1s both;
        }
        .animate-fade-up-delay-3 {
          animation: fade-up 0.8s cubic-bezier(0.2, 0, 0, 1) 1.4s both;
        }
      `}</style>
    </div>
  )
}