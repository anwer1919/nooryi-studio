import Link from "next/link"
import { Music, Target, Users, Shield, Award, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-100 dark:border-dark-border">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-primary/5 dark:from-accent-dark/10 dark:via-dark-bg dark:to-primary/10" />
        <div className="absolute top-10 right-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 dark:bg-accent-dark/20 text-primary dark:text-accent text-sm font-semibold mb-6">
            <Music size={16} />
            <span>عن Nooryi Studio</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-primary dark:text-white mb-6 leading-tight">
            منصة <span className="text-accent">احترافية</span>
            <br />
            لحجز الفنانين
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            نربط بين أفضل الفنانين والعملاء في منصة واحدة آمنة وموثوقة
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-black text-primary dark:text-white mb-6">
                رؤيتنا و<span className="text-accent">رسالتنا</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                نؤمن بأن كل فعالية تستحق لمسة فنية مميزة. لذلك أنشأنا Nooryi Studio لتكون الجسر الذي يربط بين الفنانين الموهوبين والعملاء الباحثين عن التميز.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                هدفنا هو تقديم تجربة حجز سلسة وآمنة، مع ضمان أعلى معايير الجودة والاحترافية.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 rounded-3xl blur-2xl" />
              <div className="relative card-premium p-8">
                <Target className="text-accent mb-4" size={48} />
                <h3 className="text-2xl font-bold text-primary dark:text-white mb-3">هدفنا</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  أن نكون المنصة الأولى في الوطن العربي لحجز الفنانين المحترفين
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-background-subtle dark:bg-dark-surface">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-primary dark:text-white mb-4">
              قيمنا <span className="text-accent">الأساسية</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              المبادئ التي نلتزم بها في كل ما نقدمه
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card-premium text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-accent/20 flex items-center justify-center mx-auto mb-6">
                <Shield className="text-primary dark:text-accent" size={32} />
              </div>
              <h3 className="text-xl font-bold text-primary dark:text-white mb-3">الأمان والموثوقية</h3>
              <p className="text-gray-600 dark:text-gray-400">
                نضمن لك تجربة آمنة 100% مع حماية كاملة لبياناتك ومعاملاتك المالية
              </p>
            </div>

            <div className="card-premium text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-6">
                <Award className="text-primary dark:text-accent" size={32} />
              </div>
              <h3 className="text-xl font-bold text-primary dark:text-white mb-3">الجودة والاحترافية</h3>
              <p className="text-gray-600 dark:text-gray-400">
                نتعامل فقط مع فنانين معتمدين ومختارين بعناية لضمان أعلى مستوى من الأداء
              </p>
            </div>

            <div className="card-premium text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-accent/20 flex items-center justify-center mx-auto mb-6">
                <Heart className="text-primary dark:text-accent" size={32} />
              </div>
              <h3 className="text-xl font-bold text-primary dark:text-white mb-3">رضا العملاء</h3>
              <p className="text-gray-600 dark:text-gray-400">
                نسعى دائماً لتجاوز توقعاتك وتقديم تجربة لا تُنسى في كل فعالية
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black text-primary dark:text-white mb-4">
            جاهز لبدء <span className="text-accent">رحلتك</span>؟
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            انضم إلى آلاف العملاء الذين يثقون بنا
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/artists" className="btn-primary flex items-center gap-2">
              <Users size={20} />
              تصفح الفنانين
            </Link>
            <Link href="/register" className="btn-secondary flex items-center gap-2">
              إنشاء حساب مجاني
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}