"use client"

import { useState } from "react"
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2, MessageCircle } from "lucide-react"

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // محاكاة الإرسال
    setTimeout(() => {
      setSuccess(true)
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-100 dark:border-dark-border">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-background to-primary/5 dark:from-accent-dark/10 dark:via-dark-bg dark:to-primary/10" />
        <div className="absolute top-10 right-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 dark:bg-accent-dark/20 text-primary dark:text-accent text-sm font-semibold mb-6">
            <MessageCircle size={16} />
            <span>تواصل معنا</span>
          </div>
          <h1 className="text-5xl font-black text-primary dark:text-white mb-4">
            نحن هنا <span className="text-accent">لمساعدتك</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            لديك سؤال أو استفسار؟ لا تتردد في التواصل معنا
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="card-premium">
              <div className="w-12 h-12 rounded-xl bg-accent/20 dark:bg-accent-dark/20 flex items-center justify-center mb-4">
                <Mail className="text-primary dark:text-accent" size={24} />
              </div>
              <h3 className="text-lg font-bold text-primary dark:text-white mb-2">البريد الإلكتروني</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">راسلنا في أي وقت</p>
              <a href="mailto:support@nooryi.com" className="text-accent font-semibold hover:underline">
                support@nooryi.com
              </a>
            </div>

            <div className="card-premium">
              <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-accent/20 flex items-center justify-center mb-4">
                <Phone className="text-primary dark:text-accent" size={24} />
              </div>
              <h3 className="text-lg font-bold text-primary dark:text-white mb-2">الهاتف</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">متاحون من 9 ص - 9 م</p>
              <a href="tel:+201000000000" className="text-accent font-semibold hover:underline" dir="ltr">
                +20 100 000 0000
              </a>
            </div>

            <div className="card-premium">
              <div className="w-12 h-12 rounded-xl bg-accent/20 dark:bg-accent-dark/20 flex items-center justify-center mb-4">
                <MapPin className="text-primary dark:text-accent" size={24} />
              </div>
              <h3 className="text-lg font-bold text-primary dark:text-white mb-2">العنوان</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">مقرنا الرئيسي</p>
              <p className="text-accent font-semibold">
                القاهرة، مصر
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card-premium p-8">
              {success ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 dark:bg-accent-dark/20 mb-6">
                    <CheckCircle2 className="text-accent" size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-primary dark:text-white mb-3">تم إرسال رسالتك بنجاح!</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    سنرد عليك في أقرب وقت ممكن
                  </p>
                  <button
                    onClick={() => {
                      setSuccess(false)
                      setFormData({ name: "", email: "", subject: "", message: "" })
                    }}
                    className="btn-secondary"
                  >
                    إرسال رسالة أخرى
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-primary dark:text-white mb-2">أرسل لنا رسالة</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">املأ النموذج وسنرد عليك خلال 24 ساعة</p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-primary dark:text-white mb-2">الاسم *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="اسمك الكامل"
                          className="input-modern"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary dark:text-white mb-2">البريد الإلكتروني *</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="example@email.com"
                          className="input-modern"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-primary dark:text-white mb-2">الموضوع *</label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="موضوع الرسالة"
                        className="input-modern"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-primary dark:text-white mb-2">الرسالة *</label>
                      <textarea
                        required
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="اكتب رسالتك هنا..."
                        className="input-modern resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full flex items-center justify-center gap-2 py-4"
                    >
                      {loading ? (
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}