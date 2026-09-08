"use client";
import { useState, useEffect, useRef } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, Eye, EyeOff, ShieldCheck, ArrowLeft, CheckCircle2, MessageCircle, Smartphone } from "lucide-react";

type Step = "credentials" | "otp" | "success";

export default function LoginFormClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";

  const [step, setStep] = useState<Step>("credentials");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpInfo, setOtpInfo] = useState<{ method: string; destination: string; whatsappLink?: string | null } | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [showResendOptions, setShowResendOptions] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ═══ فحص الجلسة عند التحميل (عائد من Google) ═══
  useEffect(() => {
    (async () => {
      const session = await getSession();
      const u = session?.user as any;
      if (u?.email && u.otpVerified === false) {
        setLoading(true);
        try {
          const otpData = await sendOtp(u.email);
          setFormData((p) => ({ ...p, email: u.email }));
          setOtpInfo(otpData);
          setStep("otp");
          startTimer();
        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
      } else if (u?.email && u.otpVerified === true) {
        router.replace(callbackUrl || "/");
      }
    })();
  }, []);

  useEffect(() => {
    if (step === "otp" && otpRefs.current[0]) setTimeout(() => otpRefs.current[0]?.focus(), 100);
  }, [step]);

  const startTimer = () => {
    setResendTimer(30);
    const iv = setInterval(() => setResendTimer((p) => { if (p <= 1) { clearInterval(iv); return 0; } return p - 1; }), 1000);
  };

  const sendOtp = async (email: string, method?: string) => {
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email, method }),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error || "فشل إرسال الرمز"); }
    return await res.json();
  };

  const handleSocialLogin = (provider: string) => signIn(provider, { callbackUrl: callbackUrl || "/" });

  // ═══ خطوة 1: تحقق من الباسورد عبر API (بدون signIn) + أرسل OTP ═══
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      // التحقق من الباسورد عبر API مخصص (لا ينشئ جلسة)
      const verifyRes = await fetch("/api/auth/verify-password", {
        method: "POST",
        body: JSON.stringify({ email: formData.email, password: formData.password }),
        headers: { "Content-Type": "application/json" },
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        setError(verifyData.error || "البريد أو كلمة المرور غير صحيحة");
        setLoading(false);
        return;
      }

      // الباسورد صحيح → أرسل OTP (بدون signIn)
      const otpData = await sendOtp(formData.email);
      setOtpInfo(otpData);
      setStep("otp");
      startTimer();
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ═══ مربعات OTP ═══
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nd = [...otpDigits]; nd[index] = digit; setOtpDigits(nd);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === "Enter" && otpDigits.join("").length === 6) handleOtpSubmit();
  };
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      setOtpDigits(pasted.split("").concat(Array(6).fill("")).slice(0, 6));
      otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleResend = async (method?: string) => {
    if (resendTimer > 0) return;
    setLoading(true); setError("");
    try {
      const otpData = await sendOtp(formData.email, method);
      setOtpInfo(otpData); startTimer(); setShowResendOptions(false);
      if (otpData.whatsappLink) window.open(otpData.whatsappLink, "_blank");
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ═══ خطوة 2: OTP صحيح → signIn ينشئ الجلسة الموثقة ═══
  const handleOtpSubmit = async () => {
    const otp = otpDigits.join("");
    if (otp.length !== 6) return;
    setLoading(true); setError("");
    try {
      const result = await signIn("credentials", { email: formData.email, otp, redirect: false });
      if (result?.error) {
        setError("رمز التحقق غير صحيح أو منتهي الصلاحية");
        setOtpDigits(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
        setLoading(false);
        return;
      }
      setStep("success");
      setTimeout(() => { router.push(callbackUrl || "/"); router.refresh(); }, 1200);
    } catch { setError("حدث خطأ"); setLoading(false); }
  };

  // ═══ شاشة النجاح ═══
  if (step === "success") {
    return (
      <div className="w-full max-w-md py-8 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">تم التحقق بنجاح!</h2>
        <p className="text-gray-500 dark:text-white/60">جاري تحويلك...</p>
        <Loader2 size={24} className="animate-spin text-[#d4af37] mx-auto mt-6" />
      </div>
    );
  }

  // ═══ شاشة OTP ═══
  if (step === "otp") {
    const complete = otpDigits.join("").length === 6;
    return (
      <div className="w-full max-w-md py-8">
        <button onClick={() => { setStep("credentials"); setOtpDigits(["", "", "", "", "", ""]); setError(""); }} className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/60 hover:text-[#b8941f] mb-6 transition-colors">
          <ArrowLeft size={16} /> العودة
        </button>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} className="text-[#d4af37]" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">التحقق بخطوتين</h2>
          <p className="text-gray-500 dark:text-white/60 text-sm">
            تم إرسال الرمز إلى <span className="font-bold text-gray-800 dark:text-white">{otpInfo?.destination}</span>
          </p>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400 text-center">{error}</div>}
        <div className="flex justify-center gap-2 sm:gap-3 mb-6" dir="ltr" onPaste={handleOtpPaste}>
          {otpDigits.map((d, i) => (
            <input key={i} ref={(el) => { otpRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={d}
              onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)}
              className="w-11 h-13 sm:w-13 sm:h-14 text-center text-2xl font-black text-gray-900 dark:text-white bg-white dark:bg-[#1a1a1a] border-2 border-gray-200 dark:border-white/10 rounded-xl focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30 outline-none transition-all"
              style={{ width: "2.9rem", height: "3.4rem" }} />
          ))}
        </div>
        <button onClick={handleOtpSubmit} disabled={loading || !complete} className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#111] font-black rounded-xl hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? <Loader2 size={20} className="animate-spin" /> : "تحقق ودخول"}
        </button>
        <div className="mt-6 text-center">
          {!showResendOptions ? (
            <>
              <p className="text-sm text-gray-500 dark:text-white/60 mb-2">لم تستلم الرمز؟</p>
              <button onClick={() => setShowResendOptions(true)} disabled={resendTimer > 0} className="text-sm font-bold text-[#b8941f] hover:text-[#d4af37] transition-colors disabled:text-gray-400 disabled:cursor-not-allowed">
                {resendTimer > 0 ? `إعادة الإرسال بعد ${resendTimer}ث` : "اختر طريقة أخرى"}
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <button onClick={() => handleResend("email")} disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition text-sm font-semibold text-gray-700 dark:text-white/80 disabled:opacity-50">
                <Mail size={16} /> البريد الإلكتروني
              </button>
              <button onClick={() => handleResend("whatsapp")} disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 transition text-sm font-semibold text-green-800 dark:text-green-400 disabled:opacity-50">
                <MessageCircle size={16} /> واتساب
              </button>
              <button onClick={() => handleResend("sms")} disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 transition text-sm font-semibold text-blue-800 dark:text-blue-400 disabled:opacity-50">
                <Smartphone size={16} /> رسالة نصية SMS
              </button>
              <button onClick={() => setShowResendOptions(false)} className="text-xs text-gray-400 hover:text-gray-600 mt-1">إلغاء</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══ شاشة تسجيل الدخول ═══
  return (
    <div className="w-full max-w-md py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">تسجيل الدخول</h2>
        <p className="text-gray-500 dark:text-white/60 text-sm">أدخل بيانات حسابك للمتابعة</p>
      </div>
      {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400 text-center">{error}</div>}
      <div className="space-y-3 mb-6">
        <button onClick={() => handleSocialLogin("google")} disabled={loading} className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all cursor-pointer group disabled:opacity-50">
          <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">تسجيل الدخول بحساب Google</span>
        </button>
        <button onClick={() => handleSocialLogin("apple")} disabled={loading} className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#000] border border-[#000] rounded-xl hover:bg-[#1a1a1a] hover:shadow-md transition-all cursor-pointer group disabled:opacity-50">
          <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="#fff"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.01 3.7-1.01 1.48.07 2.63.72 3.45 1.8-3.12 1.66-2.54 6.15.68 7.44-.59 1.66-1.44 3.22-2.91 4zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
          <span className="text-sm font-bold text-white group-hover:text-gray-200">تسجيل الدخول بحساب Apple</span>
        </button>
      </div>
      <div className="relative flex items-center py-4">
        <div className="flex-grow border-t border-gray-200 dark:border-white/10"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold">أو استخدم البريد الإلكتروني</span>
        <div className="flex-grow border-t border-gray-200 dark:border-white/10"></div>
      </div>
      <form onSubmit={handleCredentialsSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-1">البريد الإلكتروني</label>
          <div className="relative">
            <Mail size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full pr-10 pl-4 py-3 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] rounded-xl focus:ring-2 focus:ring-[#d4af37] outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400" placeholder="example@email.com" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-white/80 mb-1">كلمة المرور</label>
          <div className="relative">
            <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type={showPassword ? "text" : "password"} required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full pr-10 pl-10 py-3 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] rounded-xl focus:ring-2 focus:ring-[#d4af37] outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400" placeholder="••••••••" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#111] font-black rounded-xl hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all flex justify-center items-center gap-2">
          {loading ? <Loader2 size={20} className="animate-spin" /> : "متابعة"}
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-gray-500 dark:text-white/60">
        ليس لديك حساب؟ <Link href="/register" className="font-bold text-[#b8941f] hover:text-[#d4af37] transition-colors">إنشاء حساب جديد</Link>
      </div>
    </div>
  );
}