"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Music, Mail, Lock, Loader2, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة")
        setLoading(false)
        return
      }

      router.push("/")
      router.refresh()
    } catch (err) {
      setError("حدث خطأ أثناء تسجيل الدخول")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

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
              مرحباً بعودتك
              <br />
              <span className="bg-gradient-to-r from-primary to-accent dark:from-accent dark:to-accent-light bg-clip-text text-transparent">
                إلى عالم الإبداع
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              سجل دخولك للوصول إلى لوحة التحكم الخاصة بك، وإدارة حجوزاتك، ومتابعة فعالياتك بكل سهولة.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mt-12">
            {[
              { icon: "🎵", title: "إدارة الحجوزات", desc: "تابع جميع حجوزاتك في مكان واحد" },
              { icon: "💳", title: "دفع آمن", desc: "نظام دفع مشفر ومحمي 100%" },
              { icon: "📊", title: "تقارير شاملة", desc: "إحصائيات مفصلة عن أداء حسابك" },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 dark:bg-dark-surface/50 backdrop-blur-sm border border-gray-100 dark:border-dark-border">
                <div className="w-12 h-12 rounded-xl bg-accent/20 dark:bg-accent-dark/20 flex items-center justify-center text-2xl flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <p className="font-bold text-primary dark:text-white">{feature.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Login Form */}
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
            <h1 className="text-3xl font-black text-primary dark:text-white mb-2">تسجيل الدخول</h1>
            <p className="text-gray-500 dark:text-gray-400">مرحباً بعودتك! أدخل بياناتك للمتابعة</p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-black text-primary dark:text-white mb-2">تسجيل الدخول</h2>
            <p className="text-gray-500 dark:text-gray-400">أدخل بياناتك للوصول إلى حسابك</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 text-sm text-red-600 dark:text-red-400 font-semibold">
                {error}
              </div>
            )}

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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                  تسجيل الدخول
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

          {/* Sign Up Link */}
          <p className="text-center text-gray-600 dark:text-gray-400">
            ليس لديك حساب؟{" "}
            <Link 
              href="/register" 
              className="text-primary dark:text-accent font-bold hover:underline inline-flex items-center gap-1"
            >
              <Sparkles size={14} />
              أنشئ حساباً جديداً
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}