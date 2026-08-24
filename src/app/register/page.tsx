"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Music, Mail, Lock, User, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import FluidBackground from "@/components/FluidBackground"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // التحقق من البيانات في الـ Frontend
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("جميع الحقول مطلوبة")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("كلمتا المرور غير متطابقتين")
      return
    }

    if (formData.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
      return
    }

    setLoading(true)

    try {
      console.log("📤 Sending registration data:", {
        name: formData.name,
        email: formData.email,
        password: "***",
      })

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await res.json()
      console.log("📥 Registration response:", data)

      if (res.ok) {
        setSuccess("تم إنشاء الحساب بنجاح! جاري تحويلك لصفحة تسجيل الدخول...")
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setError(data.error || "فشل في إنشاء الحساب")
      }
    } catch (err: any) {
      console.error("❌ Registration error:", err)
      setError("حدث خطأ أثناء الاتصال بالخادم")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#1a0a04]">
      <FluidBackground scrimStrength="strong" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-700 rounded-lg flex items-center justify-center">
                <Music size={24} className="text-black" />
              </div>
              <span className="text-2xl font-bold text-yellow-500">Nooryi Studio</span>
            </Link>
          </div>

          {/* Form Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h1 className="text-3xl font-bold text-white text-center mb-2">إنشاء حساب جديد</h1>
            <p className="text-white/60 text-center mb-8">انضم إلينا واحجز أفضل الفنانين</p>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2">
                <CheckCircle size={20} />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* الاسم */}
              <div>
                <label className="block text-white/80 text-sm mb-2">الاسم الكامل</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pr-12 pl-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-yellow-500 focus:outline-none transition"
                    placeholder="اكتب اسمك الكامل"
                  />
                </div>
              </div>

              {/* البريد الإلكتروني */}
              <div>
                <label className="block text-white/80 text-sm mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pr-12 pl-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-yellow-500 focus:outline-none transition"
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* كلمة المرور */}
              <div>
                <label className="block text-white/80 text-sm mb-2">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pr-12 pl-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-yellow-500 focus:outline-none transition"
                    placeholder="6 أحرف على الأقل"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* تأكيد كلمة المرور */}
              <div>
                <label className="block text-white/80 text-sm mb-2">تأكيد كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pr-12 pl-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-yellow-500 focus:outline-none transition"
                    placeholder="أعد كتابة كلمة المرور"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* زر التسجيل */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    جاري إنشاء الحساب...
                  </>
                ) : (
                  "إنشاء حساب"
                )}
              </button>
            </form>

            {/* رابط تسجيل الدخول */}
            <div className="mt-6 text-center">
              <p className="text-white/60 text-sm">
                لديك حساب بالفعل؟{" "}
                <Link href="/login" className="text-yellow-500 hover:text-yellow-400 font-bold transition">
                  سجّل الدخول
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}