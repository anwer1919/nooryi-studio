"use client";
import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { signIn } from "next-auth/react";
import { CheckCircle2, XCircle } from "lucide-react";
interface OTPVerificationProps { email: string; onVerified: () => void }
type Status = "idle" | "verifying" | "success" | "error";
export default function OTPVerification({ email, onVerified }: OTPVerificationProps) {
  const [values, setValues] = useState<string[]>(Array(6).fill(""));
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isVerifyingRef = useRef(false);
  useEffect(() => { setValues(Array(6).fill("")); setStatus("idle"); setErrorMsg(""); isVerifyingRef.current = false; setTimeout(() => inputRefs.current[0]?.focus(), 150); }, [email]);
  const verifyOTP = async (otp: string) => {
    isVerifyingRef.current = true; setStatus("verifying"); setErrorMsg("");
    try {
      const result = await signIn("credentials", { email, otp, redirect: false });
      if (result?.error || !result?.ok) throw new Error("رمز غير صحيح أو منتهي الصلاحية");
      setStatus("success");
      document.cookie = "otp_verified=true; path=/; max-age=86400; SameSite=Lax";
      setTimeout(() => onVerified(), 1500);
    } catch (err: any) {
      setStatus("error"); setErrorMsg(err.message || "رمز غير صحيح"); setValues(Array(6).fill("")); isVerifyingRef.current = false;
      setTimeout(() => { setStatus("idle"); setErrorMsg(""); inputRefs.current[0]?.focus(); }, 1500);
    }
  };
  const buildNV = (c: string[], i: number, v: string) => { const r: string[] = []; for (let x = 0; x < 6; x++) r[x] = x === i ? v : c[x]; return r; };
  const handleChange = (i: number, v: string) => { if (isVerifyingRef.current || status !== "idle") return; if (v && !/^\d$/.test(v)) return; const nv = buildNV(values, i, v); setValues(nv); if (v && i < 5) inputRefs.current[i+1]?.focus(); if (nv.join("").length === 6) verifyOTP(nv.join("")); };
  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => { if (isVerifyingRef.current || status !== "idle") return; if (e.key === "Backspace") { if (values[i] === "" && i > 0) inputRefs.current[i-1]?.focus(); else setValues(buildNV(values, i, "")); } if (e.key === "ArrowLeft" && i < 5) inputRefs.current[i+1]?.focus(); if (e.key === "ArrowRight" && i > 0) inputRefs.current[i-1]?.focus(); };
  const handlePaste = (e: ClipboardEvent) => { e.preventDefault(); if (isVerifyingRef.current || status !== "idle") return; const p = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6); if (!p) return; const nv = [...values]; for (let i = 0; i < p.length; i++) nv[i] = p[i]; setValues(nv); inputRefs.current[Math.min(p.length,5)]?.focus(); if (nv.join("").length === 6) verifyOTP(nv.join("")); };
  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div className={`relative ${status === "verifying" ? "otp-spinning" : ""}`}>
        <div className="flex items-center justify-center gap-1 md:gap-2" dir="ltr">
          {Array.from({ length: 6 }).map((_, i) => {
            const filled = values[i] !== ""; const active = document.activeElement === inputRefs.current[i];
            let cls = "w-10 h-12 md:w-14 md:h-16 text-center text-xl md:text-2xl font-bold bg-transparent border-b-[3px] outline-none transition-all duration-300 ";
            if (status === "verifying") cls += "otp-verifying border-[#F5A623] text-[var(--c-fg)]";
            else if (status === "success") cls += "border-green-500 text-transparent";
            else if (status === "error") cls += "border-red-500 text-transparent";
            else if (active) cls += "border-[#F5A623] text-[var(--c-fg)] shadow-[0_4px_12px_rgba(245,166,35,0.2)] -translate-y-0.5";
            else if (filled) cls += "border-[#F5A623] text-[var(--c-fg)]";
            else cls += "border-white/15 text-[var(--c-fg)]";
            return (<div key={i} className="relative"><input ref={(el) => { inputRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={values[i]} disabled={status !== "idle"} onChange={(e) => handleChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)} onPaste={handlePaste} className={cls} />{status === "success" && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><CheckCircle2 size={24} className="text-green-500" /></div>}</div>);
          })}
        </div>
        {status === "verifying" && <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"><div className="otp-ring-loader" /></div>}
      </div>
      <div className="h-8 flex items-center justify-center w-full">
        {status === "error" && errorMsg && <div className="flex items-center gap-2 text-red-500 text-sm font-bold animate-pulse"><XCircle size={16} /> {errorMsg}</div>}
        {status === "verifying" && <p className="text-[#F5A623] text-xs font-medium animate-pulse">جاري التحقق...</p>}
        {status === "success" && <p className="text-green-500 text-xs font-bold">تم التحقق بنجاح ✓</p>}
      </div>
      <style jsx global>{`
        .otp-verifying { animation: otpPulse 0.6s ease-in-out infinite alternate; }
        .otp-verifying:nth-child(1){animation-delay:0s}.otp-verifying:nth-child(2){animation-delay:.1s}.otp-verifying:nth-child(3){animation-delay:.2s}.otp-verifying:nth-child(4){animation-delay:.3s}.otp-verifying:nth-child(5){animation-delay:.4s}.otp-verifying:nth-child(6){animation-delay:.5s}
        @keyframes otpPulse { 0%{opacity:.4;transform:scale(.95)} 100%{opacity:1;transform:scale(1.05);box-shadow:0 0 16px rgba(245,166,35,.4)} }
        .otp-spinning { animation: otpOrbit 1.2s ease-in-out infinite; }
        @keyframes otpOrbit { 0%{transform:rotate(0) scale(1);opacity:1} 25%{transform:rotate(3deg) scale(.97);opacity:.85} 50%{transform:rotate(-3deg) scale(.95);opacity:.7} 75%{transform:rotate(2deg) scale(.97);opacity:.85} 100%{transform:rotate(0) scale(1);opacity:1} }
        .otp-ring-loader { width:120%;height:120%;border:3px solid transparent;border-top-color:#F5A623;border-right-color:#F5A623;border-radius:50%;animation:ringSpin .8s linear infinite;position:absolute; }
        @keyframes ringSpin { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
