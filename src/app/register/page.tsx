"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Music, Mail, Lock, User, Phone, Loader2, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("كلمات المرور غير متطابقة")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "فشل إنشاء الحساب")
      }

      router.push("/login?registered=true")
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إنشاء الحساب")
      setLoading(false)
    }
  }

  const passwordChecks = [
    { label: "6 أحرف على الأقل", valid: formData.password.length >= 6 },
    { label: "تطابق كلمة المرور", valid: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 },
  ]

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />

      <div className="relative w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-3 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-accent blur-xl opacity-50" />
                <div className="relative bg-accent w-12 h-12 rounded-xl flex items-center justify-center shadow-glow">
                  <Music className="text-primary" size={24} />
                </div>
              </div>
              <span className="text-3xl font-black text-primary dark:text-white">
                Nooryi<span className="text-accent">.</span>
              </span>
            </Link>

            <h1 className="text-5xl font-black text-primary dark:text-white mb-4 leading-tight">
              انضم إلى
              <br />
              <span className="bg-gradient-to-r from-primary to-accent dark:from-accent dark:to-accent-light bg-clip-text text-transparent">
                عائلة Nooryi
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              أنشئ حسابك الآن واستمتع بتجربة حجز فريدة من نوعها. انضم إلى آلاف العملاء الراضين.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4 mt-12">
            {[
              { icon: "✨", title: "تسجيل مجاني", desc: "أنشئ حسابك في أقل من دقيقة" },
              { icon: "🎯", title: "حجز مباشر", desc: "احجز فنانك المفضل بضغطة زر" },
              { icon: "🔒", title: "خصوصية تامة", desc: "بياناتك محمية بأعلى معايير الأمان" },
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-gray-100 dark:border-dark-border">
                <div className="w-12 h-12 rounded-xl bg-accent/20 dark:bg-accent-dark/20 flex items-center justify-center text-2xl flex-shrink-0">
                  {benefit.icon}
                </div>
                <div>
                  <p className="font-bold text-primary dark:text-white">{benefit.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="card-premium p-8 lg:p-10">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <div className="bg-accent w-12 h-12 rounded-xl flex items-center justify-center shadow-glow">
                <Music className="text-primary" size={24} />
              </div>
              <span className="text-3xl font-black text-primary dark:text-white">
                Nooryi<span className="text-accent">.</span>
              </span>
            </Link>
            <h1 className="text-3xl font-black text-primary dark:text-white mb-2">إنشاء حساب جديد</h1>
            <p className="text-gray-500 dark:text-gray-400">انضم إلينا وابدأ رحلتك</p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-black text-primary dark:text-white mb-2">إنشاء حساب جديد</h2>
            <p className="text-gray-500 dark:text-gray-400">املأ البيانات التالية لإنشاء حسابك</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 text-sm text-red-600 dark:text-red-400 font-semibold">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-primary dark:text-white mb-2">
                الاسم الكامل
              </label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل اسمك الكامل"
                  className="input-modern pr-12"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-primary dark:text-white mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  className="input-modern pr-12"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-primary dark:text-white mb-2">
                رقم الهاتف
              </label>
              <div className="relative">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01xxxxxxxxx"
                  className="input-modern pr-12"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-primary dark:text-white mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="input-modern pr-12 pl-12"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary dark:hover:text-accent transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-primary dark:text-white mb-2">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="input-modern pr-12"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password Checks */}
            {formData.password && (
              <div className="space-y-2 p-3 rounded-xl bg-background-subtle dark:bg-dark-surface">
                {passwordChecks.map((check, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 
                      size={14} 
                      className={check.valid ? "text-accent" : "text-gray-300 dark:text-gray-600"} 
                    />
                    <span className={check.valid ? "text-primary dark:text-white font-semibold" : "text-gray-500"}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  جاري إنشاء الحساب...
                </>
              ) : (
                <>
                  إنشاء الحساب
                  <ArrowRight size={20} className="rotate-180" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-dark-border" />
            <span className="text-xs text-gray-400 font-semibold">أو</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-dark-border" />
          </div>

          {/* Login Link */}
          <p className="text-center text-gray-600 dark:text-gray-400">
            لديك حساب بالفعل؟{" "}
            <Link 
              href="/login" 
              className="text-primary dark:text-accent font-bold hover:underline inline-flex items-center gap-1"
            >
              سجل دخولك الآن
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}