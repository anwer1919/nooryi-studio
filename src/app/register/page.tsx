"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Music, Mail, Lock, User, Phone, Loader2, Eye, EyeOff,
  ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Star, CalendarCheck,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      setLoading(false);
      return;
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
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "فشل إنشاء الحساب، يرجى المحاولة لاحقاً");
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const passwordChecks = [
    { label: "6 أحرف على الأقل", valid: formData.password.length >= 6 },
    { label: "تطابق كلمة المرور", valid: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 },
  ];

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white" dir="rtl">
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
          <div className="badge-gold mb-6">
            <Sparkles size={14} />
            انضم إلى عائلة Nooryi
          </div>
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-snug mb-6">
            ابدأ رحلتك مع
            <br />
            <span className="gold-text">عالم الموسيقى</span>
          </h1>
          <p className="text-white/60 leading-relaxed max-w-md">
            أنشئ حسابك الآن واستمتع بتجربة حجز فريدة من نوعها. انضم إلى آلاف العملاء الراضين.
          </p>

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
      <div className="flex items-center justify-center p-6 bg-gradient-to-br from-white via-[#faf8f0] to-white overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* شعار الجوال */}
          <Link href="/" className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#111] to-[#232323] flex items-center justify-center">
              <Music size={20} className="text-[#d4af37]" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">Nooryi</p>
              <p className="text-[10px] text-gray-500 font-bold tracking-[0.25em] uppercase">Studio</p>
            </div>
          </Link>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2">إنشاء حساب جديد</h2>
            <p className="text-gray-500 text-sm">املأ البيانات التالية لإنشاء حسابك</p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border-2 border-red-100 rounded-2xl text-sm text-red-700 font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">الاسم الكامل *</label>
              <div className="relative">
                <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل اسمك الكامل"
                  className="input-modern"
                  style={{ paddingInlineStart: "1rem", paddingInlineEnd: "3rem" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">البريد الإلكتروني *</label>
              <div className="relative">
                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  dir="ltr"
                  className="input-modern"
                  style={{ paddingInlineStart: "1rem", paddingInlineEnd: "3rem" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">رقم الهاتف</label>
              <div className="relative">
                <Phone size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                  className="input-modern"
                  style={{ paddingInlineStart: "1rem", paddingInlineEnd: "3rem" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">كلمة المرور *</label>
              <div className="relative">
                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  dir="ltr"
                  className="input-modern"
                  style={{ paddingInlineStart: "3rem", paddingInlineEnd: "3rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#b8941f] transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">تأكيد كلمة المرور *</label>
              <div className="relative">
                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  dir="ltr"
                  className="input-modern"
                  style={{ paddingInlineStart: "1rem", paddingInlineEnd: "3rem" }}
                />
              </div>
            </div>

            {formData.password && (
              <div className="p-3 bg-[#faf8f0] border border-[#e8e4d9] rounded-2xl space-y-2">
                {passwordChecks.map((check, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2
                      size={14}
                      className={check.valid ? "text-[#b8941f]" : "text-gray-300"}
                    />
                    <span className={`text-xs font-semibold ${check.valid ? "text-gray-800" : "text-gray-400"}`}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-gold w-full py-4 text-base">
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

          <div className="mt-8 text-center text-sm text-gray-500">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="font-black text-[#b8941f] hover:text-[#d4af37] transition inline-flex items-center gap-1">
              <Sparkles size={14} />
              سجل دخولك الآن
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}