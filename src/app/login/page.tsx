"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Music,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || ""

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // التحقق من الحقول
    if (!formData.email || !formData.password) {
      setError("يرجى ملء جميع الحقول")
      setLoading(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        console.error("❌ Login error:", result.error)
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة")
        setLoading(false)
        return
      }

      // جلب الجلسة بعد تسجيل الدخول
      const sessionRes = await fetch("/api/auth/session", {
        cache: "no-store",
      })
      const session = await sessionRes.json()
      const role = session?.user?.role

      console.log("✅ Login successful. Role:", role)

      setSuccess(true)

      // إعادة التوجيه حسب الدور
      setTimeout(() => {
        if (callbackUrl) {
          window.location.href = callbackUrl
          return
        }

        if (
          role === "SUPER_ADMIN" ||
          role === "ADMIN" ||
          role === "ARTIST_MANAGER"
        ) {
          window.location.href = "/admin"
        } else {
          window.location.href = "/"
        }
      }, 1000)
    } catch (err) {
      console.error("❌ Login submit error:", err)
      setError("حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden" dir="rtl">
      {/* ═══════════ الخلفية ═══════════ */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FEFCE8] via-white to-[#FEF9C3]" />

      {/* دوائر زخرفية */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-[#D9FF3F]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#EAFF75]/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-[#D9FF3F]/10 rounded-full blur-2xl" />

      {/* ═══════════ Header ═══════════ */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D9FF3F] to-[#EAFF75] flex items-center justify-center shadow-lg border-2 border-[#D9FF3F] group-hover:scale-110 transition-transform">
              <span className="text-gray-900 text-xl font-black">N</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">Nooryi</h1>
              <p className="text-[10px] text-gray-500 font-bold tracking-widest">
                STUDIO
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition"
          >
            <ArrowRight size={16} />
            العودة للرئيسية
          </Link>
        </div>
      </header>

      {/* ═══════════ Main Content ═══════════ */}
      <main className="relative z-10 flex items-center justify-center px-4 py-12 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          {/* العنوان */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#D9FF3F]/20 border border-[#D9FF3F]/40 rounded-full px-4 py-1.5 mb-4">
              <Sparkles size={14} className="text-gray-700" />
              <span className="text-gray-700 font-bold text-xs">
                مرحباً بعودتك
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
              تسجيل الدخول
            </h2>
            <p className="text-gray-600 text-sm">
              ادخل بياناتك للوصول إلى حسابك
            </p>
          </div>

          {/* ═══════════ نموذج تسجيل الدخول ═══════════ */}
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 p-8 relative overflow-hidden">
            {/* زخرفة علوية */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D9FF3F] via-[#EAFF75] to-[#D9FF3F]" />

            {/* رسائل الخطأ والنجاح */}
            {error && (
              <div className="mb-5 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3 animate-shake">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700 font-bold">
                    فشل تسجيل الدخول
                  </p>
                  <p className="text-xs text-red-600 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-5 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3">
                <CheckCircle2 size={20} className="text-green-500" />
                <p className="text-sm text-green-700 font-bold">
                  تم تسجيل الدخول بنجاح! جاري التحويل...
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* البريد الإلكتروني */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="example@email.com"
                    dir="ltr"
                    className="w-full pr-12 pl-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#D9FF3F] focus:bg-white focus:outline-none transition-all text-gray-900"
                    disabled={loading || success}
                    required
                  />
                </div>
              </div>

              {/* كلمة المرور */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full pr-12 pl-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#D9FF3F] focus:bg-white focus:outline-none transition-all text-gray-900"
                    disabled={loading || success}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                    disabled={loading || success}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* زر تسجيل الدخول */}
              <button
                type="submit"
                disabled={loading || success}
                className="w-full py-4 bg-gradient-to-r from-[#D9FF3F] to-[#EAFF75] text-gray-900 rounded-xl font-black text-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    جاري تسجيل الدخول...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 size={20} />
                    تم بنجاح!
                  </>
                ) : (
                  <>
                    <Music size={20} />
                    تسجيل الدخول
                  </>
                )}
              </button>
            </form>

            {/* روابط إضافية */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-gray-500">ليس لديك حساب؟</span>
                <Link
                  href="/register"
                  className="font-bold text-gray-900 hover:text-[#D9FF3F] transition relative group"
                >
                  إنشاء حساب جديد
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D9FF3F] group-hover:w-full transition-all" />
                </Link>
              </div>
            </div>
          </div>

          {/* معلومات للمساعدة */}
          <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D9FF3F]/20 flex items-center justify-center flex-shrink-0">
                <Sparkles size={18} className="text-gray-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">
                  هل نسيت كلمة المرور؟
                </p>
                <p className="text-xs text-gray-600">
                  تواصل مع الإدارة لإعادة تعيين كلمة المرور الخاصة بك.
                </p>
              </div>
            </div>
          </div>

          {/* تنبيه callbackUrl */}
          {callbackUrl && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xs text-blue-700 text-center">
                💡 سيتم توجيهك إلى الصفحة المطلوبة بعد تسجيل الدخول
              </p>
            </div>
          )}
        </div>
      </main>

      {/* ═══════════ Footer ═══════════ */}
      <footer className="relative z-10 py-6 text-center">
        <p className="text-xs text-gray-500">
          © 2026 Nooryi Studio. جميع الحقوق محفوظة.
        </p>
      </footer>

      {/* CSS للأنيميشن */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}