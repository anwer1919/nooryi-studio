"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import {
  Music, Mail, Lock, User, Phone, Loader2, Eye, EyeOff,
  ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Star, CalendarCheck,
} from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
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
      const response = await fetch("/api/register", {
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
      if (!response.ok) throw new Error(data.error || "فشل إنشاء الحساب")
      router.push("/login?registered=true")
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const passwordChecks = [
    { label: "6 أحرف على الأقل", valid: formData.password.length >= 6 },
    { label: "تطابق كلمة المرور", valid: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 },
  ]

  const inputClass = "w-full pr-12 pl-4 py-3.5 border border-[#D4AF37]/20 bg-[#1a1a1a] text-white placeholder:text-gray-500 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-all"

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0a0a0a]" dir="rtl">
      {/* ═══ لوحة العلامة ═══ */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#0a0a0a] via-[#161616] to-[#232323] p-12 relative overflow-hidden">
        <div className="absolute top-20 left-16 w-72 h-72 bg-[#d4af37]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-16 right-16 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl"></div>
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#b8941f] flex items-center justify-center shadow-xl">
            <Music size={24} className="text-[#0a0a0a]" />
          </div>
          <div>
            <p className="text-xl font-black text-white">Nooryi</p>
            <p className="text-[10px] text-[#d4af37] font-bold tracking-[0.25em] uppercase">Studio</p>
          </div>
        </Link>
        <div className="relative z-10">
          <div className="badge-gold mb-6"><Sparkles size={14} /> انضم إلى عائلة Nooryi</div>
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-snug mb-6">
            ابدأ رحلتك مع<br /><span className="gold-text">عالم الموسيقى</span>
          </h1>
          <p className="text-white/60 leading-relaxed max-w-md">أنشئ حسابك الآن واستمتع بتجربة حجز فريدة من نوعها.</p>
          <div className="space-y-3 mt-10">
            {[
              { icon: Sparkles, title: "تسجيل مجاني", desc: "أنشئ حسابك في أقل من دقيقة" },
              { icon: Music, title: "حجز مباشر", desc: "احجز فنانك المفضل بضغطة زر" },
              { icon: ShieldCheck, title: "خصوصية تامة", desc: "بياناتك محمية بأعلى معايير الأمان" },
            ].map((b, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-11 h-11 rounded-xl bg-[#d4af37]/10 flex items-center justify-center flex-shrink-0">
                  <b.icon size={18} className="text-[#d4af37]" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm mb-0.5">{b.title}</p>
                  <p className="text-xs text-white/60">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          {[
            { icon: Music, label: "+150 فنان" },
            { icon: CalendarCheck, label: "+500 فعالية" },
            { icon: Star, label: "4.9 تقييم" },
          ].map((s, i) => (
            <div key={i} className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
              <s.icon size={16} className="text-[#d4af37] mx-auto mb-1" />
              <p className="text-[11px] text-white/70 font-bold">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ نموذج التسجيل ═══ */}
      <div className="flex items-center justify-center p-4 md:p-6 bg-[#0a0a0a] overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* شعار الجوال */}
          <Link href="/" className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#b8941f] flex items-center justify-center shadow-xl">
              <Music size={20} className="text-[#0a0a0a]" />
            </div>
            <div>
              <p className="text-xl font-black text-white">Nooryi</p>
              <p className="text-[10px] text-[#d4af37] font-bold tracking-[0.25em] uppercase">Studio</p>
            </div>
          </Link>

          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">إنشاء حساب جديد</h2>
            <p className="text-gray-400 text-sm">املأ البيانات التالية لإنشاء حسابك</p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 font-bold text-center">{error}</div>
          )}

          {/* ═══ نموذج التسجيل التقليدي (أولاً) ═══ */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">الاسم الكامل <span className="text-[#D4AF37]">*</span></label>
              <div className="relative">
                <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="أدخل اسمك الكامل" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">البريد الإلكتروني <span className="text-[#D4AF37]">*</span></label>
              <div className="relative">
                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input type="email" required autoComplete="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="example@email.com" dir="ltr" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">رقم الهاتف</label>
              <div className="relative">
                <Phone size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="01xxxxxxxxx" dir="ltr" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">كلمة المرور <span className="text-[#D4AF37]">*</span></label>
              <div className="relative">
                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input type={showPassword ? "text" : "password"} required autoComplete="new-password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" dir="ltr" className="w-full pr-12 pl-12 py-3.5 border border-[#D4AF37]/20 bg-[#1a1a1a] text-white placeholder:text-gray-500 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] outline-none transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#D4AF37] transition">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">تأكيد كلمة المرور <span className="text-[#D4AF37]">*</span></label>
              <div className="relative">
                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input type={showPassword ? "text" : "password"} required autoComplete="new-password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="••••••••" dir="ltr" className={inputClass} />
              </div>
            </div>

            {formData.password && (
              <div className="p-3 bg-[#1a1a1a] border border-[#D4AF37]/10 rounded-xl space-y-2">
                {passwordChecks.map((check, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className={check.valid ? "text-[#D4AF37]" : "text-gray-600"} />
                    <span className={`text-xs font-semibold ${check.valid ? "text-gray-200" : "text-gray-500"}`}>{check.label}</span>
                  </div>
                ))}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#b8941f] text-[#0a0a0a] font-black rounded-xl hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all flex justify-center items-center gap-2 disabled:opacity-50">
              {loading ? (<><Loader2 size={20} className="animate-spin" /> جاري إنشاء الحساب...</>) : (<>إنشاء الحساب <ArrowRight size={20} style={{ transform: "rotate(180deg)" }} /></>)}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="font-black text-[#D4AF37] hover:text-[#F4E5B8] transition inline-flex items-center gap-1">
              <Sparkles size={14} /> سجل دخولك الآن
            </Link>
          </div>

          {/* ═══ فاصل ═══ */}
          <div className="relative flex items-center py-6 mt-4">
            <div className="flex-grow border-t border-[#D4AF37]/10"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-xs font-semibold">أو سجّل عبر</span>
            <div className="flex-grow border-t border-[#D4AF37]/10"></div>
          </div>

          {/* ═══ أزرار Social Signup (في الأسفل) ═══ */}
          <div className="space-y-3">
            <button onClick={() => signIn("google", { callbackUrl: "/my-bookings" })} className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#1a1a1a] border border-[#D4AF37]/15 rounded-xl hover:bg-[#222] hover:border-[#D4AF37]/30 transition-all cursor-pointer group disabled:opacity-50">
              <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-sm font-bold text-gray-300 group-hover:text-white">Google</span>
            </button>

            <button onClick={() => signIn("apple", { callbackUrl: "/my-bookings" })} className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#1a1a1a] border border-[#D4AF37]/15 rounded-xl hover:bg-[#222] hover:border-[#D4AF37]/30 transition-all cursor-pointer group disabled:opacity-50">
              <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="#fff">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.01 3.7-1.01 1.48.07 2.63.72 3.45 1.8-3.12 1.66-2.54 6.15.68 7.44-.59 1.66-1.44 3.22-2.91 4zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="text-sm font-bold text-gray-300 group-hover:text-white">Apple</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}