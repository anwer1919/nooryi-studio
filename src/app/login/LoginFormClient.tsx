"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, Eye, EyeOff, ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";

type Step = "credentials" | "otp" | "success";

export default function LoginFormClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";

  const [step, setStep] = useState<Step>("credentials");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", otp: "" });
  const [otpInfo, setOtpInfo] = useState<{ method: string; destination: string } | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);

  // ═══ إرسال OTP ═══
  const sendOtp = async (email: string) => {
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("فشل إرسال رمز التحقق");
    return await res.json();
  };

  // ═══ بدء عداد إعادة الإرسال ═══
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ═══ تسجيل دخول Google/Apple مع 2FA ═══
  const handleSocialLogin = async (provider: string) => {
    setLoading(true);
    setError("");
    try {
      // أولاً: تسجيل الدخول عبر المزود
      const result = await signIn(provider, { redirect: false, callbackUrl });
      if (result?.error) {
        setError("فشل تسجيل الدخول عبر " + provider);
        setLoading(false);
        return;
      }

      // الحصول على إيميل المستخدم من الجلسة
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const email = session?.user?.email;

      if (!email) {
        // لا يوجد إيميل (نادر) — السماح بالدخول مباشرة
        router.push(callbackUrl || "/");
        router.refresh();
        return;
      }

      // إرسال OTP للإيميل/الهاتف المحفوظ
      const otpData = await sendOtp(email);
      setFormData((prev) => ({ ...prev, email }));
      setOtpInfo({ method: otpData.method, destination: otpData.destination });
      setPendingProvider(provider);
      setStep("otp");
      startResendTimer();
    } catch (err: any) {
      setError(err.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  // ═══ تسجيل دخول Credentials مع 2FA ═══
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // التحقق من الباسورد أولاً
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        setLoading(false);
        return;
      }

      // إرسال OTP
      const otpData = await sendOtp(formData.email);
      setOtpInfo({ method: otpData.method, destination: otpData.destination });
      setPendingProvider("credentials");
      setStep("otp");
      startResendTimer();
    } catch (err: any) {
      setError(err.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  // ═══ إعادة إرسال OTP ═══
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError("");
    try {
      const otpData = await sendOtp(formData.email);
      setOtpInfo({ method: otpData.method, destination: otpData.destination });
      startResendTimer();
    } catch { setError("فشل إعادة الإرسال"); }
    finally { setLoading(false); }
  };

  // ═══ التحقق من OTP ═══
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
        headers: { "Content-Type": "application/json" },
      });

      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        setError(data.error || "رمز غير صحيح");
        setLoading(false);
        return;
      }

      setStep("success");
      setTimeout(() => {
        router.push(callbackUrl || "/");
        router.refresh();
      }, 1500);
    } catch { setError("حدث خطأ"); }
    finally { setLoading(false); }
  };

  // ═══ شاشة النجاح ═══
  if (step === "success") {
    return (
      <div className="w-full max-w-md py-8 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">تم التحقق بنجاح!</h2>
        <p className="text-gray-500">جاري تحويلك إلى حسابك...</p>
        <Loader2 size={24} className="animate-spin text-[#d4af37] mx-auto mt-6" />
      </div>
    );
  }

  // ═══ شاشة OTP ═══
  if (step === "otp") {
    return (
      <div className="w-full max-w-md py-8">
        <button onClick={() => { setStep("credentials"); setFormData({ ...formData, otp: "" }); setError(""); setPendingProvider(null); }} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#b8941f] mb-6 transition-colors">
          <ArrowLeft size={16} /> العودة
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} className="text-[#d4af37]" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">التحقق بخطوتين</h2>
          <p className="text-gray-500 text-sm">
            تم إرسال رمز التحقق إلى{" "}
            <span className="font-bold text-gray-800">{otpInfo?.destination}</span>
            {" "}عبر {otpInfo?.method === "phone" ? "رسالة نصية" : "البريد الإلكتروني"}
          </p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 text-center">{error}</div>}

        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 text-center">أدخل رمز التحقق المكون من 6 أرقام</label>
            <input
              type="text" required autoFocus
              value={formData.otp}
              onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
              className="w-full py-4 text-center text-2xl tracking-[0.5em] font-black border-2 border-gray-200 rounded-2xl focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/30 outline-none transition-all placeholder:tracking-normal placeholder:text-base placeholder:font-normal"
              placeholder="000000" maxLength={6} inputMode="numeric"
            />
          </div>
          <button type="submit" disabled={loading || formData.otp.length !== 6} className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#111] font-black rounded-xl hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <Loader2 size={20} className="animate-spin" /> : "تحقق ومتابعة"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">لم تستلم الرمز؟</p>
          <button onClick={handleResendOtp} disabled={resendTimer > 0 || loading} className="text-sm font-bold text-[#b8941f] hover:text-[#d4af37] transition-colors disabled:text-gray-400 disabled:cursor-not-allowed">
            {resendTimer > 0 ? `إعادة الإرسال بعد ${resendTimer} ثانية` : "إعادة إرسال الرمز"}
          </button>
        </div>
      </div>
    );
  }

  // ═══ شاشة Credentials ═══
  return (
    <div className="w-full max-w-md py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-900 mb-2">تسجيل الدخول</h2>
        <p className="text-gray-500 text-sm">أدخل بيانات حسابك للمتابعة</p>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 text-center">{error}</div>}

      {/* Social Login */}
      <div className="space-y-3 mb-6">
        <button onClick={() => handleSocialLogin("google")} disabled={loading} className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all cursor-pointer group disabled:opacity-50">
          <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">تسجيل الدخول بحساب Google</span>
        </button>
        <button onClick={() => handleSocialLogin("apple")} disabled={loading} className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#000000] border border-[#000000] rounded-xl hover:bg-[#1a1a1a] hover:shadow-md transition-all cursor-pointer group disabled:opacity-50">
          <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="#FFFFFF"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.01 3.7-1.01 1.48.07 2.63.72 3.45 1.8-3.12 1.66-2.54 6.15.68 7.44-.59 1.66-1.44 3.22-2.91 4zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
          <span className="text-sm font-bold text-white group-hover:text-gray-200">تسجيل الدخول بحساب Apple</span>
        </button>
      </div>

      <div className="relative flex items-center py-4">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold">أو استخدم البريد الإلكتروني</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      {/* Credentials Form */}
      <form onSubmit={handleCredentialsSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">البريد الإلكتروني</label>
          <div className="relative">
            <Mail size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] outline-none transition-all" placeholder="example@email.com" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">كلمة المرور</label>
          <div className="relative">
            <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type={showPassword ? "text" : "password"} required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full pr-10 pl-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] outline-none transition-all" placeholder="••••••••" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#111] font-black rounded-xl hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all flex justify-center items-center gap-2">
          {loading ? <Loader2 size={20} className="animate-spin" /> : "متابعة"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        ليس لديك حساب؟ <Link href="/register" className="font-bold text-[#b8941f] hover:text-[#d4af37] transition-colors">إنشاء حساب جديد</Link>
      </div>
    </div>
  );
}