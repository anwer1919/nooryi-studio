"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail, Lock, Loader2, Eye, EyeOff, ArrowRight,
  Sparkles, ShieldCheck, Star, CalendarCheck, Music,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      setError("يرجى ملء جميع الحقول");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        setLoading(false);
        return;
      }

      const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
      const session = await sessionRes.json();
      const role = session?.user?.role;

      setTimeout(() => {
        if (callbackUrl) { window.location.href = callbackUrl; return; }
        if (role === "SUPER_ADMIN" || role === "ADMIN" || role === "ARTIST_MANAGER") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      }, 600);
    } catch {
      setError("حدث خطأ أثناء تسجيل الدخول");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white" dir="rtl">
      {/* ═══ لوحة العلامة ═══ */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#0a0a0a] via-[#161616] to-[#232323] p-12 relative overflow-hidden">
        <div className="absolute top-20 left-16 w-72 h-72 bg-[#d4af37]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-16 right-16 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl"></div>

        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#b8941f] flex items-center justify-center shadow-xl">
            <span className="text-[#0a0a0a] text-2xl font-black">N</span>
          </div>
          <div>
            <p className="text-xl font-black text-white">Nooryi</p>
            <p className="text-[10px] text-[#d4af37] font-bold tracking-[0.25em] uppercase">Studio</p>
          </div>
        </Link>

        <div className="relative z-10">
          <div className="badge-gold mb-6" style={{ background: "rgb(212 175 55 / .12)" }}>
            <Sparkles size={14} />
            منصة حجز الفنانين الأولى
          </div>
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-snug mb-6">
            مرحباً بعودتك إلى
            <br />
            <span className="gold-text">عالم الموسيقى</span>
          </h1>
          <p className="text-white/60 leading-relaxed max-w-md">
            سجّل دخولك لمتابعة حجوزاتك، اكتشاف فنانين جدد، وتنظيم فعاليات لا تُنسى.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-10 max-w-md">
            {[
              { icon: Music, label: "+150 فنان" },
              { icon: CalendarCheck, label: "+500 فعالية" },
              { icon: Star, label: "4.9 تقييم" },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <s.icon size={18} className="text-[#d4af37] mx-auto mb-2" />
                <p className="text-xs text-white/70 font-bold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-white/40 text-xs relative z-10">
          <ShieldCheck size={14} className="text-[#d4af37]" />
          دفع آمن ومشفّر • ضمان استرداد كامل
        </div>
      </div>

      {/* ═══ نموذج الدخول ═══ */}
      <div className="flex items-center justify-center p-6 bg-gradient-to-br from-white via-[#faf8f0] to-white">
        <div className="w-full max-w-md">
          <Link href="/" className="lg:hidden flex items-center gap-3 justify-center mb-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#111] to-[#232323] flex items-center justify-center">
              <span className="text-[#d4af37] text-2xl font-black">N</span>
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">Nooryi</p>
              <p className="text-[10px] text-gray-500 font-bold tracking-[0.25em] uppercase">Studio</p>
            </div>
          </Link>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2">تسجيل الدخول</h2>
            <p className="text-gray-500 text-sm">أهلاً بعودتك! أدخل بياناتك للمتابعة</p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border-2 border-red-100 rounded-2xl text-sm text-red-700 font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  dir="ltr"
                  className="input-modern"
                  style={{ paddingInlineStart: "1rem", paddingInlineEnd: "3rem" }}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  dir="ltr"
                  className="input-modern"
                  style={{ paddingInlineStart: "3rem", paddingInlineEnd: "3rem" }}
                  disabled={loading}
                  required
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

            <button type="submit" disabled={loading} className="btn-gold w-full py-4 text-base">
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="font-black text-[#b8941f] hover:text-[#d4af37] transition">
              إنشاء حساب جديد
            </Link>
          </div>

          <div className="mt-6">
            <Link href="/" className="flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition">
              <ArrowRight size={14} />
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}