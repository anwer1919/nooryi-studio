"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Music, Mail, Lock, Loader2, AlertCircle } from "lucide-react"
import FluidBackground from "@/components/FluidBackground"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError("حدث خطأ أثناء تسجيل الدخول")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#1a0a04]">
      <FluidBackground scrimStrength="strong" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-700 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Music size={20} className="text-black" />
            </div>
            <span className="text-2xl font-bold text-yellow-500">Nooryi Studio</span>
          </Link>

          {/* Glass Card */}
          <div className="bg-white/8 backdrop-blur-2xl border border-white/16 rounded-2xl p-8 shadow-2xl">
            <h1 className="text-3xl font-bold text-white mb-2 text-center">
              تسجيل الدخول
            </h1>
            <p className="text-white/60 text-center mb-8">
              أهلاً بعودتك! سجّل الدخول للمتابعة
            </p>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-white/80 text-sm mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-yellow-500 focus:outline-none transition"
                    placeholder="you@example.com"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-yellow-500 focus:outline-none transition"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-white/90 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  "تسجيل الدخول"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/60 text-sm">
                ليس لديك حساب؟{" "}
                <Link href="/register" className="text-yellow-500 hover:text-yellow-400 font-bold">
                  إنشاء حساب جديد
                </Link>
              </p>
            </div>
          </div>

          {/* Admin Credentials Hint */}
          <div className="mt-6 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white/60 text-xs">
            <p className="font-bold text-white/80 mb-1">🔐 بيانات تجريبية:</p>
            <p>أدمن: <code className="text-yellow-500">admin@nooryi.com</code> / <code className="text-yellow-500">admin123</code></p>
            <p>فنان: <code className="text-yellow-500">anwer@nooryi.com</code> / <code className="text-yellow-500">anwer123</code></p>
          </div>
        </div>
      </div>
    </div>
  )
}