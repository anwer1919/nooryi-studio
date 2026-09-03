import Link from "next/link"
import { Music, Star, Users, Calendar, Shield, CreditCard, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-purple-700">Nooryi</h1>
            <p className="text-xs text-gray-500">STUDIO</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-purple-700 font-bold hover:bg-purple-50 rounded-lg transition"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-purple-700 text-white rounded-lg font-bold hover:bg-purple-800 transition"
            >
              إنشاء حساب
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-purple-700 font-bold mb-4">منصة حجز الفنانين الأولى</p>
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
            احجز أفضل الفنانين
            <br />
            <span className="text-purple-700">لفعالياتك المميزة</span>
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            منصة احترافية تجمع بين أفضل الفنانين والموسيقيين في مكان واحد.
            احجز بسهولة، ادفع بأمان، واستمتع بتجربة لا تُنسى.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/artists"
              className="px-8 py-4 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 transition shadow-lg"
            >
              تصفح الفنانين
            </Link>
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-purple-700 border-2 border-purple-700 rounded-xl font-bold hover:bg-purple-50 transition"
            >
              ابدأ الآن مجاناً
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl font-black text-purple-700">+150</p>
            <p className="text-gray-600 mt-2">فنان محترف</p>
          </div>
          <div>
            <p className="text-4xl font-black text-purple-700">+500</p>
            <p className="text-gray-600 mt-2">فعالية ناجحة</p>
          </div>
          <div>
            <p className="text-4xl font-black text-purple-700">4.9★</p>
            <p className="text-gray-600 mt-2">تقييم العملاء</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-4">
            لماذا تختار Nooryi؟
          </h2>
          <p className="text-center text-gray-600 mb-12">
            نوفر لك تجربة حجز استثنائية بأعلى معايير الجودة
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "فنانين معتمدين",
                desc: "جميع الفنانين يخضعون لعملية تحقق صارمة",
              },
              {
                icon: CreditCard,
                title: "دفع آمن 100%",
                desc: "نظام دفع مشفر مع ضمان استرداد كامل",
              },
              {
                icon: Zap,
                title: "حجز سهل وسريع",
                desc: "احجز فنانك المفضل في دقائق",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition"
              >
                <f.icon className="text-purple-700 mb-4" size={40} />
                <h3 className="text-xl font-black text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-2xl font-black text-purple-400 mb-2">Nooryi.</p>
          <p className="text-gray-400 text-sm">
            © 2026 Nooryi Studio. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  )
}