"use client"

import Link from "next/link"
import { Music, Target, Heart, Zap, Users, Award, Star } from "lucide-react"
import FluidBackground from "@/components/LazyFluidBackground"

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: "رسالتنا",
      description: "نهدف إلى تقديم تجربة حجز استثنائية للفنانين والعملاء على حد سواء، مع ضمان الجودة والاحترافية في كل حفلة.",
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
    },
    {
      icon: Heart,
      title: "شغفنا",
      description: "نؤمن بأن الموسيقى والفن هما لغة عالمية توحد القلوب، ونسعى لإيصال أفضل الفنانين إلى مناسباتكم الخاصة.",
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
    },
    {
      icon: Zap,
      title: "سرعتنا",
      description: "نضمن استجابة سريعة لطلبات الحجز، مع تأكيد خلال 24 ساعة ودعم فني متاح على مدار الساعة.",
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
    },
    {
      icon: Award,
      title: "جودتنا",
      description: "نختار بعناية نخبة من الفنانين المحترفين ذوي الخبرة الطويلة في إحياء الحفلات والمناسبات الكبرى.",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
    },
  ]

  const stats = [
    { value: "50+", label: "فنان محترف" },
    { value: "10K+", label: "حجز ناجح" },
    { value: "4.9", label: "متوسط التقييم", icon: Star },
    { value: "24/7", label: "دعم فني" },
  ]

  return (
    <div className="relative min-h-screen bg-[#1a0a04]">
      <FluidBackground scrimStrength="strong" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 py-4 px-4 sticky top-0 bg-black/40 backdrop-blur-xl z-40">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-yellow-500 to-amber-700 rounded-lg flex items-center justify-center">
                <Music size={18} className="text-black" />
              </div>
              <span className="text-xl font-bold text-yellow-500">Nooryi Studio</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/artists" className="text-white/70 hover:text-yellow-500 transition text-sm">
                الفنانين
              </Link>
              <Link href="/contact" className="text-white/70 hover:text-yellow-500 transition text-sm">
                اتصل بنا
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="animate-fade-up">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              من <span className="text-yellow-500">نحن</span>
            </h1>
            <p className="text-xl text-white/70 leading-relaxed max-w-2xl mx-auto">
              Nooryi Studio هي منصة رائدة في مجال حجز الفنانين للحفلات والمناسبات الخاصة، 
              نجمع بين أفضل المواهب وأرقى الخدمات لنقدم لكم تجربة لا تُنسى.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-up-delay">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:border-yellow-500/30 transition"
                >
                  <div className="text-3xl md:text-4xl font-bold text-yellow-500 mb-2 flex items-center justify-center gap-1">
                    {stat.value}
                    {Icon && <Icon size={24} className="fill-yellow-400 text-yellow-400" />}
                  </div>
                  <div className="text-white/60 text-sm">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Values Section */}
        <section className="max-w-6xl mx-auto px-4 pb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">قيمنا</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div
                  key={index}
                  className={`bg-white/5 backdrop-blur-xl border rounded-2xl p-8 hover:-translate-y-1 transition-all duration-300 ${value.border}`}
                >
                  <div className={`w-14 h-14 ${value.bg} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon size={28} className={value.color} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                  <p className="text-white/60 leading-relaxed">{value.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-4 pb-20 text-center">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
            <Users size={48} className="mx-auto text-yellow-500 mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              جاهز تبدأ رحلتك معنا؟
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              انضم إلى آلاف العملاء الذين وثقوا بنا لإحياء مناسباتهم الخاصة بأفضل الفنانين.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/artists"
                className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-4 px-8 rounded-full transition shadow-lg shadow-amber-500/20"
              >
                استكشف الفنانين ←
              </Link>
              <Link
                href="/contact"
                className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-8 rounded-full border border-white/20 transition"
              >
                تواصل معنا
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8 px-4">
          <div className="max-w-6xl mx-auto text-center text-white/40 text-sm">
            © 2026 Nooryi Studio — جميع الحقوق محفوظة
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fade-up 0.7s cubic-bezier(0.2, 0, 0, 1) both;
        }
        .animate-fade-up-delay {
          animation: fade-up 0.7s cubic-bezier(0.2, 0, 0, 1) 0.2s both;
        }
      `}</style>
    </div>
  )
}