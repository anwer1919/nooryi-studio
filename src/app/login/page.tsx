"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Music, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("البريد الإلكتروني أو كلمة السر غير صحيحة")
      } else {
        // جلب بيانات الجلسة لمعرفة دور المستخدم
        const sessionResponse = await fetch("/api/auth/session")
        const session = await sessionResponse.json()
        
        // توجيه حسب الدور
        if (session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN") {
          router.push("/admin")
        } else if (session?.user?.role === "ARTIST") {
          router.push("/admin/artists")
        } else {
          // المستخدم العادي يذهب إلى حجوزاته
          router.push("/my-bookings")
        }
        router.refresh()
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع، حاول مرة أخرى")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[120px] animate-pulse-slow" />
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-gradient-to-br from-yellow-400 to-amber-600 p-2.5 rounded-2xl">
                <Music className="text-black" size={24} />
              </div>
            </div>
            <span className="text-2xl font-black tracking-tight">Nooryi</span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black mb-2">مرحباً بعودتك</h1>
            <p className="text-white/60 text-sm">سجّل الدخول للوصول إلى حسابك</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pr-12 pl-4 text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-500/50 focus:bg-white/[0.07] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                كلمة السر
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pr-12 pl-12 text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-500/50 focus:bg-white/[0.07] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-xl opacity-75 group-hover:opacity-100 blur transition-all" />
              <div className="relative bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold py-3.5 rounded-xl transition-all group-hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:group-hover:scale-100">
                <span className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    <>
                      تسجيل الدخول
                      <ArrowRight size={18} className="rotate-180" />
                    </>
                  )}
                </span>
              </div>
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm text-white/60">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
              أنشئ حساباً جديداً
            </Link>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-white/40 hover:text-white/70 transition-colors">
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}