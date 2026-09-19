"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import OTPVerification from "@/components/OTPVerification";

export default function LoginFormClient() {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // التحقق من البيانات الأولية وإرسال OTP
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        setStep("otp");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "بيانات الدخول غير صحيحة");
      }
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-display text-3xl mb-2">Nooryi Studio</h1>
          <p className="text-[var(--c-muted)] text-sm">تسجيل الدخول إلى حسابك</p>
        </div>

        <div className="dash-card p-6 md:p-8">
          {step === "credentials" ? (
            /* ═══ خطوة 1: البريد وكلمة المرور ═══ */
            <form onSubmit={handleCredentialsSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[var(--c-muted)] mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--c-orange)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    dir="ltr"
                    className="w-full pr-10 pl-4 py-3 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-fg)] focus:border-[var(--c-orange)] focus:shadow-[0_0_0_3px_rgba(245,166,35,0.15)] outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--c-muted)] mb-2">كلمة المرور</label>
                <div className="relative">
                  <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--c-orange)]" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    dir="ltr"
                    className="w-full pr-10 pl-10 py-3 rounded-lg border border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-fg)] focus:border-[var(--c-orange)] focus:shadow-[0_0_0_3px_rgba(245,166,35,0.15)] outline-none transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-muted)] hover:text-[var(--c-orange)] transition"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "جاري الإرسال..." : <>متابعة <ArrowRight size={16} /></>}
              </button>

              <div className="text-center">
                <Link href="/forgot-password" className="text-xs text-[var(--c-orange)] hover:underline">
                  نسيت كلمة المرور؟
                </Link>
              </div>
            </form>
          ) : (
            /* ═══ خطوة 2: التحقق من OTP ═══ */
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="card-title text-lg mb-1">رمز التحقق</h2>
                <p className="text-[var(--c-muted)] text-xs">
                  تم إرسال الرمز إلى <span className="text-[var(--c-orange)] font-bold">{email}</span>
                </p>
              </div>

              <OTPVerification
                email={email}
                redirectOnSuccess="/admin"
              />

              <div className="text-center pt-2">
                <button
                  onClick={() => { setStep("credentials"); setError(""); }}
                  className="text-xs text-[var(--c-muted)] hover:text-[var(--c-orange)] transition"
                >
                  ← العودة لتسجيل الدخول
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center mt-6 text-xs text-[var(--c-muted)]">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="text-[var(--c-orange)] font-bold hover:underline">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </div>
  );
}
