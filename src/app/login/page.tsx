"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, Eye, EyeOff, Sparkles, ShieldCheck, Star, CalendarCheck, Music, Smartphone, Globe, Apple } from "lucide-react";

export default function LoginPage() {
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
      if (res.ok) {
        setOtpSent(true);
        setError("");
      } else {
        setError("فشل إرسال الرمز");
      }
    } catch { setError("حدث خطأ") }
    finally { setLoading(false) }
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
    } catch { setError("حدث خطأ") }
    finally { setLoading(false) }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white" dir="rtl">
      {/* اللوحة الجانبية */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#0a0a0a] via-[#161616] to-[#232323] p-12 relative overflow-hidden">
        <div className="absolute top-20 left-16 w-72 h-72 bg-[#d4af37]/10 rounded-full blur-3xl"></div>
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#b8941f] flex items-center justify-center shadow-xl">
            <Music size={24} className="text-[#0a0a0a]" />
          </div>
          <div>
            <p className="text-xl font-black text-white">Nooryi</p>
            <p className="text-[10px] text-[#d4af37] font-bold tracking-[0.25em] uppercase">Studio</p>
          </div>
        </Link>
        <div className="relative z-10 space-y-6">
           <h1 className="text-4xl font-black text-white leading-tight">مرحباً بعودتك إلى<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f4e5b8]">عالم الموسيقى</span></h1>
           <p className="text-white/60">سجل دخولك لمتابعة حجوزاتك وتنظيم فعاليات لا تُنسى.</p>
        </div>
      </div>

      {/* نموذج الدخول */}
      <div className="flex items-center justify-center p-6 bg-gradient-to-br from-white via-[#faf8f0] to-white">
        <div className="w-full max-w-md py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2">تسجيل الدخول</h2>
            <p className="text-gray-500 text-sm">اختر طريقة تسجيل الدخول المفضلة لديك</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 text-center">{error}</div>}

          {/* أزرار Social Login */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={() => signIn("google", { callbackUrl })} className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-bold text-sm">
              <Globe size={18} className="text-blue-500" /> Google
            </button>
            <button onClick={() => signIn("github", { callbackUrl })} className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-bold text-sm">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> GitHub
            </button>
            <button onClick={() => signIn("apple", { callbackUrl })} className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-bold text-sm">
              <Apple size={18} className="text-black" /> Apple
            </button>
          </div>

          <div className="relative flex items-center py-2 mb-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs">أو استخدم البريد الإلكتروني</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">البريد الإلكتروني</label>
              <div className="relative">
                <Mail size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] outline-none" placeholder="example@email.com" />
              </div>
            </div>

            {mode === "password" ? (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">كلمة المرور</label>
                <div className="relative">
                  <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPassword ? "text" : "password"} required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full pr-10 pl-10 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d4af37] outline-none" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
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
                     <button type="button" onClick={handleSendOtp} disabled={loading} className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 whitespace-nowrap">
                       {loading ? <Loader2 size={18} className="animate-spin"/> : "إرسال الرمز"}
                     </button>
                   )}
                </div>
                {otpSent && <p className="text-xs text-green-600 mt-1">تم إرسال الرمز إلى بريدك الإلكتروني</p>}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#111] font-black rounded-xl hover:shadow-lg transition flex justify-center items-center gap-2">
              {loading ? <Loader2 size={20} className="animate-spin"/> : "تسجيل الدخول"}
            </button>
            
            <div className="text-center">
               <button type="button" onClick={() => setMode(mode === "password" ? "otp" : "password")} className="text-sm text-[#b8941f] font-bold hover:underline">
                 {mode === "password" ? "الدخول برمز التحقق (OTP)" : "الدخول بكلمة المرور"}
               </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            ليس لديك حساب؟ <Link href="/register" className="font-bold text-[#b8941f]">إنشاء حساب جديد</Link>
          </div>
        </div>
      </div>
    </div>
  );
}