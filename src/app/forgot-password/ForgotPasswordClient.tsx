"use client"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, Loader2, ShieldCheck, CheckCircle2, ArrowLeft, Eye, EyeOff } from "lucide-react"

type Step = "email" | "reset" | "done"

export default function ForgotPasswordClient() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [destination, setDestination] = useState("")
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""])
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => { if (step === "reset" && otpRefs.current[0]) setTimeout(() => otpRefs.current[0]?.focus(), 100) }, [step])

  const startTimer = () => { setResendTimer(30); const iv = setInterval(() => setResendTimer(p => { if (p <= 1) { clearInterval(iv); return 0 }; return p - 1 }), 1000) }

  const sendOtp = async () => {
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/auth/send-otp", { method: "POST", body: JSON.stringify({ email, method: "email" }), headers: { "Content-Type": "application/json" } })
      const d = await res.json()
      if (!res.ok) { setError(d.error || "فشل إرسال الرمز"); setLoading(false); return }
      setDestination(d.destination || "")
      setStep("reset")
      startTimer()
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleOtpChange = (index: number, value: string) => { const d = value.replace(/\D/g, "").slice(-1); const nd = [...otpDigits]; nd[index] = d; setOtpDigits(nd); if (d && index < 5) otpRefs.current[index + 1]?.focus() }
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => { if (e.key === "Backspace" && !otpDigits[index] && index > 0) otpRefs.current[index - 1]?.focus() }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setError("كلمتا المرور غير متطابقتين"); return }
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, otp: otpDigits.join(""), newPassword }),
        headers: { "Content-Type": "application/json" },
      })
      const d = await res.json()
      if (!res.ok) { setError(d.error || "فشل إعادة التعيين"); setLoading(false); return }
      setStep("done")
      setTimeout(() => router.push("/login"), 2500)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  if (step === "done") return (
    <div className="py-8 text-center">
      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 animate-bounce"><CheckCircle2 size={32} className="text-green-400"/></div>
      <h2 className="text-xl font-black text-white mb-2">تم تغيير كلمة المرور!</h2>
      <p className="text-gray-400 text-sm">جاري تحويلك لتسجيل الدخول...</p>
    </div>
  )

  if (step === "reset") {
    const complete = otpDigits.join("").length === 6 && newPassword.length >= 6 && confirmPassword.length >= 6
    return (
      <form onSubmit={handleReset} className="space-y-4">
        <div className="text-center mb-2">
          <div className="w-14 h-14 rounded-2xl bg-[#F5A623]/10 flex items-center justify-center mx-auto mb-3"><ShieldCheck size={28} className="text-[#F5A623]"/></div>
          <h2 className="text-xl font-black text-white mb-1">إعادة تعيين كلمة المرور</h2>
          <p className="text-gray-400 text-xs">أدخل الرمز المرسل إلى <span className="text-white font-bold">{destination}</span> وكلمة المرور الجديدة</p>
        </div>
        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 text-center">{error}</div>}
        <div className="flex justify-center gap-2" dir="ltr">
          {otpDigits.map((d, i) => (<input key={i} ref={el => { otpRefs.current[i] = el }} type="text" inputMode="numeric" maxLength={1} value={d} onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKeyDown(i, e)} className="text-center text-xl font-black text-white bg-[#1a1a1a] border-2 border-[#F5A623]/20 rounded-xl focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/30 outline-none transition-all" style={{ width: "2.6rem", height: "3rem" }}/>))}
        </div>
        <div className="relative">
          <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"/>
          <input type={showPass ? "text" : "password"} required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full pr-9 pl-9 py-3 border border-[#F5A623]/20 bg-[#1a1a1a] rounded-xl focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none transition text-white text-sm placeholder:text-gray-600" placeholder="كلمة المرور الجديدة"/>
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">{showPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
        </div>
        <div className="relative">
          <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"/>
          <input type={showPass ? "text" : "password"} required minLength={6} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full pr-9 pl-4 py-3 border border-[#F5A623]/20 bg-[#1a1a1a] rounded-xl focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none transition text-white text-sm placeholder:text-gray-600" placeholder="تأكيد كلمة المرور"/>
        </div>
        <button type="submit" disabled={loading || !complete} className="w-full py-3.5 bg-gradient-to-r from-[#F5A623] to-[#E8961A] text-[#0a0a0a] font-black rounded-xl hover:shadow-lg hover:shadow-[#F5A623]/30 transition-all flex justify-center items-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 size={18} className="animate-spin"/> : "تغيير كلمة المرور"}
        </button>
        <div className="text-center">
          <button type="button" onClick={sendOtp} disabled={resendTimer > 0 || loading} className="text-xs font-bold text-[#E8961A] hover:text-[#F5A623] transition disabled:text-gray-600">
            {resendTimer > 0 ? `إعادة الإرسال بعد ${resendTimer}ث` : "إعادة إرسال الرمز"}
          </button>
          <button type="button" onClick={() => { setStep("email"); setOtpDigits(["", "", "", "", "", ""]); setError("") }} className="block mx-auto mt-2 text-xs text-gray-500 hover:text-gray-300 transition">تغيير البريد</button>
        </div>
      </form>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#F5A623]/10 flex items-center justify-center mx-auto mb-3"><ShieldCheck size={28} className="text-[#F5A623]"/></div>
        <h2 className="text-xl font-black text-white mb-1">نسيت كلمة المرور؟</h2>
        <p className="text-gray-400 text-xs">أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق لإعادة التعيين</p>
      </div>
      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 text-center">{error}</div>}
      <div className="relative">
        <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"/>
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full pr-9 pl-4 py-3 border border-[#F5A623]/20 bg-[#1a1a1a] rounded-xl focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none transition text-white text-sm placeholder:text-gray-600" placeholder="example@email.com"/>
      </div>
      <button onClick={sendOtp} disabled={loading || !email} className="w-full py-3.5 bg-gradient-to-r from-[#F5A623] to-[#E8961A] text-[#0a0a0a] font-black rounded-xl hover:shadow-lg hover:shadow-[#F5A623]/30 transition-all flex justify-center items-center gap-2 disabled:opacity-50">
        {loading ? <Loader2 size={18} className="animate-spin"/> : "إرسال رمز التحقق"}
      </button>
    </div>
  )
}