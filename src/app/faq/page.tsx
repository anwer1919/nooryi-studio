"use client"

import { useState } from "react"
import Link from "next/link"
import { Music, ChevronDown, HelpCircle } from "lucide-react"
import FluidBackground from "@/components/FluidBackground"

interface FAQItem {
  question: string
  answer: string
  category: string
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [activeCategory, setActiveCategory] = useState("ALL")

  const categories = [
    { id: "ALL", name: "الكل" },
    { id: "BOOKING", name: "الحجز" },
    { id: "PAYMENT", name: "الدفع" },
    { id: "ARTIST", name: "الفنانين" },
    { id: "GENERAL", name: "عام" },
  ]

  const faqs: FAQItem[] = [
    {
      category: "BOOKING",
      question: "كيف أحجز فناناً لحفلتي؟",
      answer: "يمكنك الحجز بسهولة من خلال تصفح قائمة الفنانين، واختيار الفنان المناسب، ثم تحديد التاريخ والفترة المتاحة، وملء نموذج الحجز. ستحتاج إلى دفع عربون لتأكيد الحجز.",
    },
    {
      category: "BOOKING",
      question: "متى يتم تأكيد الحجز؟",
      answer: "يتم مراجعة طلب الحجز خلال 24 ساعة، وبعد الموافقة ودفع العربون يصبح الحجز مؤكداً. ستصلك رسالة تأكيد بالبريد الإلكتروني وواتساب.",
    },
    {
      category: "BOOKING",
      question: "هل يمكنني إلغاء الحجز؟",
      answer: "نعم، يمكنك إلغاء الحجز قبل 7 أيام من الموعد واسترداد 50% من العربون. الإلغاء قبل أقل من 7 أيام لا يرد العربون.",
    },
    {
      category: "PAYMENT",
      question: "ما هي طرق الدفع المتاحة؟",
      answer: "نوفر 4 طرق للدفع: بطاقة الائتمان (فيزا/ماستركارد)، فودافون كاش، إنستا باي، والتحويل البنكي. جميع المعاملات مشفرة وآمنة.",
    },
    {
      category: "PAYMENT",
      question: "كم مبلغ العربون المطلوب؟",
      answer: "الحد الأدنى للعربون هو 5,000 جنيه مصري، أو 30% من إجمالي قيمة الحجز (أيهما أكبر). المتبقي يُدفع قبل الحفلة بـ 48 ساعة.",
    },
    {
      category: "PAYMENT",
      question: "هل الدفع آمن؟",
      answer: "نعم، جميع المعاملات مشفرة بتقنية SSL 256-bit. لا نخزن بيانات بطاقتك الائتمانية على خوادمنا.",
    },
    {
      category: "ARTIST",
      question: "كيف أختار الفنان المناسب؟",
      answer: "يمكنك تصفح ملفات الفنانين ومشاهدة صورهم وقراءة التقييمات من عملاء سابقين. كل فنان له فئة (مغني، دي جي، فرقة، إلخ) ونطاق أسعار واضح.",
    },
    {
      category: "ARTIST",
      question: "هل يمكنني الانضمام كفنان للمنصة؟",
      answer: "بالتأكيد! أرسل لنا رسالة من صفحة اتصل بنا مع بياناتك وخبراتك، وسيتواصل معك فريقنا خلال 48 ساعة لمراجعة طلبك.",
    },
    {
      category: "GENERAL",
      question: "هل الخدمة متاحة في جميع المحافظات؟",
      answer: "نعم، نغطي جميع محافظات مصر. قد تختلف الأسعار حسب المسافة والموقع، وستظهر لك الأسعار النهائية قبل تأكيد الحجز.",
    },
    {
      category: "GENERAL",
      question: "ماذا لو تأخر الفنان عن الموعد؟",
      answer: "نلتزم بالمواعيد بدقة. في حالة التأخر لأكثر من 30 دقيقة، يحق لك الحصول على خصم 20% من قيمة الحجز أو إعادة جدولة مجانية.",
    },
    {
      category: "GENERAL",
      question: "هل يوجد دعم فني؟",
      answer: "نعم، فريق الدعم متاح 24/7 عبر الهاتف والواتساب والبريد الإلكتروني. نرد على جميع الاستفسارات خلال ساعة واحدة.",
    },
  ]

  const filteredFaqs = activeCategory === "ALL"
    ? faqs
    : faqs.filter(faq => faq.category === activeCategory)

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
              <Link href="/about" className="text-white/70 hover:text-yellow-500 transition text-sm">
                من نحن
              </Link>
              <Link href="/contact" className="text-white/70 hover:text-yellow-500 transition text-sm">
                اتصل بنا
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <HelpCircle size={48} className="mx-auto text-yellow-500 mb-6 animate-fade-up" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-up">
            الأسئلة <span className="text-yellow-500">الشائعة</span>
          </h1>
          <p className="text-xl text-white/70 animate-fade-up-delay">
            كل ما تحتاج معرفته عن خدماتنا في مكان واحد
          </p>
        </section>

        {/* Category Filter */}
        <section className="max-w-4xl mx-auto px-4 pb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id)
                  setOpenIndex(null)
                }}
                className={`px-5 py-2 rounded-full font-medium transition ${
                  activeCategory === cat.id
                    ? "bg-yellow-600 text-black"
                    : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* FAQ List */}
        <section className="max-w-3xl mx-auto px-4 pb-20">
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12 text-white/60">
                لا توجد أسئلة في هذه الفئة حالياً
              </div>
            ) : (
              filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-yellow-500/30 transition"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-right"
                  >
                    <span className="text-white font-bold text-lg">{faq.question}</span>
                    <ChevronDown
                      size={20}
                      className={`text-yellow-500 flex-shrink-0 transition-transform duration-300 ${
                        openIndex === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openIndex === index ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <p className="px-5 pb-5 text-white/70 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-3xl mx-auto px-4 pb-20 text-center">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10">
            <h2 className="text-2xl font-bold text-white mb-3">
              لم تجد إجابتك؟
            </h2>
            <p className="text-white/60 mb-6">
              فريقنا جاهز للإجابة على جميع استفساراتك
            </p>
            <Link
              href="/contact"
              className="inline-block bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-8 rounded-full transition shadow-lg"
            >
              تواصل معنا ←
            </Link>
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