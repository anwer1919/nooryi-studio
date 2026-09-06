"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function LoginFormClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"password" | "otp">("password");
  const [otpSent, setOtpSent] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", otp: "" });

  const handleSendOtp = async () => {
    if (!formData.email) return setError("يرجى إدخال البريد الإلكتروني أولاً");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ email: formData.email }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) { setOtpSent(true); setError(""); }
      else { setError("فشل إرسال الرمز"); }
    } catch { setError("حدث خطأ"); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: mode === "password" ? formData.password : undefined,
        otp: mode === "otp" ? formData.otp : undefined,
        redirect: false,
        callbackUrl
      });
      if (result?.error) {
        setError(result.error.includes("CredentialsSignin") ? "بيانات غير صحيحة" : result.error);
      } else {
        router.push(callbackUrl || "/");
        router.refresh();
      }
    } catch { setError("حدث خطأ"); }
    finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-md py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-900 mb-2">تسجيل الدخول</h2>
        <p className="text-gray-500 text-sm">اختر طريقة تسجيل الدخول المفضلة لديك</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 text-center">
          {error}
        </div>
      )}

      {/* ═══ نموذج البريد وكلمة المرور ═══ */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">البريد الإلكتروني</label>
          <div className="relative">
            <Mail size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] outline-none transition-all" placeholder="example@email.com" />
          </div>
        </div>

        {mode === "password" ? (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">كلمة المرور</label>
            <div className="relative">
              <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={showPassword ? "text" : "password"} required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full pr-10 pl-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] outline-none transition-all" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">رمز التحقق (OTP)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ShieldCheck size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" required value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})} className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] outline-none text-center tracking-widest font-bold" placeholder="000000" maxLength={6} />
              </div>
              {!otpSent && (
                <button type="button" onClick={handleSendOtp} disabled={loading} className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 whitespace-nowrap transition-colors">
                  {loading ? <Loader2 size={18} className="animate-spin"/> : "إرسال الرمز"}
                </button>
              )}
            </div>
            {otpSent && <p className="text-xs text-green-600 mt-1">تم إرسال الرمز إلى بريدك الإلكتروني</p>}
          </div>
        )}

        {/* ═══ زر تسجيل الدخول الرئيسي ═══ */}
        <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#111] font-black rounded-xl hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all flex justify-center items-center gap-2">
          {loading ? <Loader2 size={20} className="animate-spin"/> : "تسجيل الدخول"}
        </button>

        <div className="text-center">
          <button type="button" onClick={() => setMode(mode === "password" ? "otp" : "password")} className="text-sm text-[#b8941f] font-bold hover:underline">
            {mode === "password" ? "الدخول برمز التحقق (OTP)" : "الدخول بكلمة المرور"}
          </button>
        </div>
      </form>

      {/* ═══ فاصل ═══ */}
      <div className="relative flex items-center py-6">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold">أو سجّل الدخول باستخدام</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      {/* ═══ أزرار Social Login تحت زر تسجيل الدخول ═══ */}
      <div className="space-y-3">
        {/* زر Google */}
        <button onClick={() => signIn("google", { callbackUrl })} className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all cursor-pointer group">
          <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">تسجيل الدخول بحساب Google</span>
        </button>

        {/* زر Apple */}
        <button onClick={() => signIn("apple", { callbackUrl })} className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#000000] border border-[#000000] rounded-xl hover:bg-[#1a1a1a] hover:shadow-md transition-all cursor-pointer group">
          <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="#FFFFFF">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.01 3.7-1.01 1.48.07 2.63.72 3.45 1.8-3.12 1.66-2.54 6.15.68 7.44-.59 1.66-1.44 3.22-2.91 4zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          <span className="text-sm font-bold text-white group-hover:text-gray-200">تسجيل الدخول بحساب Apple</span>
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        ليس لديك حساب؟ <Link href="/register" className="font-bold text-[#b8941f] hover:text-[#d4af37] transition-colors">إنشاء حساب جديد</Link>
      </div>
    </div>
  );
}