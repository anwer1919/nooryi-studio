"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Music, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Loader2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles 
} from "lucide-react"

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

    // التحقق من تطابق كلمات المرور
    if (formData.password !== formData.confirmPassword) {
      setError("كلمات المرور غير متطابقة")
      setLoading(false)
      return
    }

    // التحقق من طول كلمة المرور
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
        // ✅ عرض رسالة الخطأ الدقيقة القادمة من الـ API
        throw new Error(data.error || "فشل إنشاء الحساب، يرجى المحاولة لاحقاً")
      }

      // عند النجاح، توجيه المستخدم لصفحة الدخول
      router.push("/login?registered=true")
      
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  // مؤشرات التحقق من كلمة المرور
  const passwordChecks = [
    { label: "6 أحرف على الأقل", valid: formData.password.length >= 6 },
    { label: "تطابق كلمة المرور", valid: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 },
  ]

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "var(--color-background)",
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: "var(--space-4)",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background Decorations */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: "400px", height: "400px",
        borderRadius: "50%", backgroundColor: "var(--color-accent)", opacity: 0.1,
        filter: "blur(100px)", transform: "translate(-30%, -30%)"
      }} />
      <div style={{
        position: "absolute", bottom: 0, right: 0, width: "400px", height: "400px",
        borderRadius: "50%", backgroundColor: "var(--color-primary)", opacity: 0.05,
        filter: "blur(100px)", transform: "translate(30%, 30%)"
      }} />

      <div style={{ 
        position: "relative", 
        width: "100%", 
        maxWidth: "1100px", 
        display: "grid", 
        gap: "var(--space-8)", 
        alignItems: "center" 
      }} className="lg:grid-cols-2">
        
        {/* Left Side - Branding (Desktop Only) */}
        <div className="hidden lg:block">
          <div style={{ marginBottom: "var(--space-8)" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-8)", textDecoration: "none" }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "var(--radius-xl)",
                backgroundColor: "var(--color-accent)", display: "flex",
                alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-glow)"
              }}>
                <Music className="text-primary" size={24} style={{ color: "var(--color-primary)" }} />
              </div>
              <span style={{ fontSize: "var(--text-3xl)", fontWeight: "900", color: "var(--color-primary)" }}>
                Nooryi<span style={{ color: "var(--color-accent-dark)" }}>.</span>
              </span>
            </Link>

            <h1 style={{ fontSize: "var(--text-5xl)", fontWeight: "900", color: "var(--color-text-primary)", marginBottom: "var(--space-4)", lineHeight: 1.1 }}>
              انضم إلى
              <br />
              <span style={{
                background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent-dark) 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
              }}>
                عائلة Nooryi
              </span>
            </h1>
            <p style={{ fontSize: "var(--text-lg)", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
              أنشئ حسابك الآن واستمتع بتجربة حجز فريدة من نوعها. انضم إلى آلاف العملاء الراضين.
            </p>
          </div>

          {/* Benefits */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", marginTop: "var(--space-12)" }}>
            {[
              { icon: "✨", title: "تسجيل مجاني", desc: "أنشئ حسابك في أقل من دقيقة" },
              { icon: "🎯", title: "حجز مباشر", desc: "احجز فنانك المفضل بضغطة زر" },
              { icon: "🔒", title: "خصوصية تامة", desc: "بياناتك محمية بأعلى معايير الأمان" },
            ].map((benefit, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: "var(--space-4)", padding: "var(--space-4)",
                borderRadius: "var(--radius-xl)", backgroundColor: "var(--color-background-subtle)",
                border: "1px solid var(--color-border-light)"
              }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "var(--radius-lg)",
                  backgroundColor: "var(--color-accent-50)", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0
                }}>
                  {benefit.icon}
                </div>
                <div>
                  <p style={{ fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "4px" }}>{benefit.title}</p>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="card" style={{ padding: "var(--space-8)" }}>
          {/* Mobile Logo */}
          <div className="lg:hidden" style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-6)", textDecoration: "none" }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "var(--radius-xl)",
                backgroundColor: "var(--color-accent)", display: "flex",
                alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-glow)"
              }}>
                <Music size={24} style={{ color: "var(--color-primary)" }} />
              </div>
              <span style={{ fontSize: "var(--text-3xl)", fontWeight: "900", color: "var(--color-primary)" }}>
                Nooryi<span style={{ color: "var(--color-accent-dark)" }}>.</span>
              </span>
            </Link>
            <h1 style={{ fontSize: "var(--text-3xl)", fontWeight: "900", color: "var(--color-text-primary)", marginBottom: "var(--space-2)" }}>إنشاء حساب جديد</h1>
            <p style={{ color: "var(--color-text-secondary)" }}>انضم إلينا وابدأ رحلتك</p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block" style={{ marginBottom: "var(--space-8)" }}>
            <h2 style={{ fontSize: "var(--text-3xl)", fontWeight: "900", color: "var(--color-text-primary)", marginBottom: "var(--space-2)" }}>إنشاء حساب جديد</h2>
            <p style={{ color: "var(--color-text-secondary)" }}>املأ البيانات التالية لإنشاء حسابك</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {error && (
              <div style={{
                backgroundColor: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "var(--radius-lg)",
                padding: "var(--space-3)", fontSize: "var(--text-sm)", color: "#DC2626", fontWeight: "600"
              }}>
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "var(--space-2)" }}>
                الاسم الكامل *
              </label>
              <div style={{ position: "relative" }}>
                <User size={18} style={{ position: "absolute", right: "var(--space-3)", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل اسمك الكامل"
                  className="input"
                  style={{ paddingRight: "44px" }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "var(--space-2)" }}>
                البريد الإلكتروني *
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{ position: "absolute", right: "var(--space-3)", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  className="input"
                  style={{ paddingRight: "44px" }}
                  dir="ltr"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "var(--space-2)" }}>
                رقم الهاتف
              </label>
              <div style={{ position: "relative" }}>
                <Phone size={18} style={{ position: "absolute", right: "var(--space-3)", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01xxxxxxxxx"
                  className="input"
                  style={{ paddingRight: "44px" }}
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "var(--space-2)" }}>
                كلمة المرور *
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", right: "var(--space-3)", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="input"
                  style={{ paddingRight: "44px", paddingLeft: "44px" }}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", left: "var(--space-3)", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "var(--color-text-tertiary)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "600", color: "var(--color-text-primary)", marginBottom: "var(--space-2)" }}>
                تأكيد كلمة المرور *
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", right: "var(--space-3)", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="input"
                  style={{ paddingRight: "44px" }}
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password Checks */}
            {formData.password && (
              <div style={{
                display: "flex", flexDirection: "column", gap: "var(--space-2)", padding: "var(--space-3)",
                borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-background-subtle)"
              }}>
                {passwordChecks.map((check, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                    <CheckCircle2 
                      size={14} 
                      style={{ color: check.valid ? "var(--color-success)" : "var(--color-text-tertiary)" }} 
                    />
                    <span style={{ 
                      fontSize: "var(--text-xs)", 
                      color: check.valid ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
                      fontWeight: check.valid ? "600" : "400"
                    }}>
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
              className="btn-primary"
              style={{ 
                width: "100%", 
                justifyContent: "center", 
                padding: "var(--space-4)", 
                marginTop: "var(--space-2)",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  جاري إنشاء الحساب...
                </>
              ) : (
                <>
                  إنشاء الحساب
                  <ArrowRight size={20} style={{ transform: "rotate(180deg)" }} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", margin: "var(--space-6) 0" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }} />
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", fontWeight: "600" }}>أو</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }} />
          </div>

          {/* Login Link */}
          <p style={{ textAlign: "center", color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
            لديك حساب بالفعل؟{" "}
            <Link 
              href="/login" 
              style={{ color: "var(--color-primary)", fontWeight: "700", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              <Sparkles size={14} />
              سجل دخولك الآن
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}