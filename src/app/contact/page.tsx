"use client"

import { useState } from "react"
import Link from "next/link"
import { Music, Mail, Phone, Send, MessageCircle, Clock, CheckCircle, Loader2 } from "lucide-react"
import FluidBackground from "@/components/LazyFluidBackground"

const WHATSAPP_NUMBER = "249998989999"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    await new Promise(resolve => setTimeout(resolve, 1500))

    setSubmitting(false)
    setSuccess(true)
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" })

    setTimeout(() => setSuccess(false), 5000)
  }

  const contactMethods = [
    {
      icon: Phone,
      title: "الهاتف",
      value: "+249 998 989 999",
      link: "tel:+249998989999",
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      icon: Mail,
      title: "البريد الإلكتروني",
      value: "info@nooryi.com",
      link: "mailto:info@nooryi.com",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      icon: MessageCircle,
      title: "واتساب",
      value: "+249 998 989 999",
      link: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("مرحباً، أريد الاستفسار عن خدماتكم")}`,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Clock,
      title: "ساعات العمل",
      value: "24/7 - على مدار الساعة",
      link: "#",
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
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
              <Link href="/about" className="text-white/70 hover:text-yellow-500 transition text-sm">
                من نحن
              </Link>
              <Link href="/faq" className="text-white/70 hover:text-yellow-500 transition text-sm">
                الأسئلة الشائعة
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-up">
            تواصل <span className="text-yellow-500">معنا</span>
          </h1>
          <p className="text-xl text-white/70 animate-fade-up-delay">
            نحن هنا لمساعدتك. أرسل لنا رسالتك وسنرد عليك في أقرب وقت.
          </p>
        </section>

        {/* Contact Methods */}
        <section className="max-w-4xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactMethods.map((method, index) => {
              const Icon = method.icon
              return (
                <a
                  key={index}
                  href={method.link}
                  target={method.link.startsWith("http") ? "_blank" : undefined}
                  rel={method.link.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:border-yellow-500/30 transition group"
                >
                  <div className={`w-12 h-12 ${method.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon size={24} className={method.color} />
                  </div>
                  <h3 className="text-white font-bold mb-1">{method.title}</h3>
                  <p className="text-white/60 text-sm" dir="ltr">{method.value}</p>
                </a>
              )
            })}
          </div>
        </section>

        {/* Contact Form */}
        <section className="max-w-3xl mx-auto px-4 pb-20">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              أرسل لنا رسالة
            </h2>

            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2">
                <CheckCircle size={20} />
                تم إرسال رسالتك بنجاح! سنرد عليك في أقرب وقت.
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-white/80 text-sm mb-2">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-yellow-500 focus:outline-none transition"
                    placeholder="اسمك"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-2">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-yellow-500 focus:outline-none transition"
                    placeholder="email@example.com"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-white/80 text-sm mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-yellow-500 focus:outline-none transition"
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-2">الموضوع *</label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-yellow-500 focus:outline-none transition"
                  >
                    <option value="">اختر الموضوع</option>
                    <option value="booking">استفسار عن حجز</option>
                    <option value="payment">مشكلة في الدفع</option>
                    <option value="artist">الانضمام كفنان</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">الرسالة *</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-yellow-500 focus:outline-none transition resize-none"
                  placeholder="اكتب رسالتك هنا..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-4 rounded-lg transition disabled:opacity-50 shadow-lg"
              >
                {submitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    إرسال الرسالة
                  </>
                )}
              </button>
            </form>
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