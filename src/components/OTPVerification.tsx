"use client";

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { signIn } from "next-auth/react";
import { CheckCircle2, XCircle } from "lucide-react";

interface OTPVerificationProps {
  email: string;
  onVerified: () => void;
}

type Status = "idle" | "verifying" | "success" | "error";

export default function OTPVerification({ email, onVerified }: OTPVerificationProps) {
  const [values, setValues] = useState<string[]>(Array(6).fill(""));
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isVerifyingRef = useRef(false);

  useEffect(() => {
    setValues(Array(6).fill(""));
    setStatus("idle");
    setErrorMsg("");
    isVerifyingRef.current = false;
    setTimeout(() => inputRefs.current[0]?.focus(), 150);
  }, [email]);

  const verifyOTP = async (otp: string) => {
    console.log("[OTP] 🔥 Verifying via signIn:", otp);
    isVerifyingRef.current = true;
    setStatus("verifying");
    setErrorMsg("");

    try {
      // المسار 2 في auth.ts: signIn مع OTP فقط
      const result = await signIn("credentials", {
        email,
        otp,
        redirect: false,
      });

      console.log("[OTP] signIn result:", result);

      if (result?.error || !result?.ok) {
        throw new Error(result?.error === "CredentialsSignin" ? "رمز غير صحيح أو منتهي الصلاحية" : "رمز غير صحيح");
      }

      console.log("[OTP] ✅ SUCCESS");
      setStatus("success");
      setTimeout(() => onVerified(), 1500);
    } catch (err: any) {
      console.error("[OTP] ❌ FAILED:", err.message);
      setStatus("error");
      setErrorMsg(err.message || "رمز غير صحيح");
      setValues(Array(6).fill(""));
      isVerifyingRef.current = false;
      setTimeout(() => {
        setStatus("idle");
        setErrorMsg("");
        inputRefs.current[0]?.focus();
      }, 1500);
    }
  };

  const buildNewValues = (current: string[], index: number, value: string): string[] => {
    const r: string[] = [];
    for (let i = 0; i < 6; i++) r[i] = i === index ? value : current[i];
    return r;
  };

  const handleChange = (index: number, value: string) => {
    if (isVerifyingRef.current || status !== "idle") return;
    if (value && !/^\d$/.test(value)) return;
    const nv = buildNewValues(values, index, value);
    setValues(nv);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (nv.join("").length === 6) verifyOTP(nv.join(""));
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (isVerifyingRef.current || status !== "idle") return;
    if (e.key === "Backspace") {
      if (values[index] === "" && index > 0) inputRefs.current[index - 1]?.focus();
      else setValues(buildNewValues(values, index, ""));
    }
    if (e.key === "ArrowLeft" && index < 5) inputRefs.current[index + 1]?.focus();
    if (e.key === "ArrowRight" && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    if (isVerifyingRef.current || status !== "idle") return;
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const nv = [...values];
    for (let i = 0; i < pasted.length; i++) nv[i] = pasted[i];
    setValues(nv);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    if (nv.join("").length === 6) verifyOTP(nv.join(""));
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div className={`relative ${status === "verifying" ? "otp-spinning" : ""}`}>
        <div className="flex items-center justify-center gap-1 md:gap-2" dir="ltr">
          {Array.from({ length: 6 }).map((_, index) => {
            const isFilled = values[index] !== "";
            const isActive = document.activeElement === inputRefs.current[index];
            let cls = "w-10 h-12 md:w-14 md:h-16 text-center text-xl md:text-2xl font-bold bg-transparent border-b-[3px] outline-none transition-all duration-300 ease-out ";
            if (status === "verifying") cls += "otp-verifying border-[#F5A623] text-[var(--c-fg)]";
            else if (status === "success") cls += "otp-success border-green-500 text-transparent";
            else if (status === "error") cls += "otp-error border-red-500 text-transparent";
            else if (isActive) cls += "otp-active border-[#F5A623] text-[var(--c-fg)] shadow-[0_4px_12px_rgba(245,166,35,0.2)] -translate-y-0.5";
            else if (isFilled) cls += "otp-filled border-[#F5A623] text-[var(--c-fg)]";
            else cls += "otp-empty border-white/15 text-[var(--c-fg)]";

            return (
              <div key={index} className="relative group">
                <input ref={(el) => { inputRefs.current[index] = el; }} type="text" inputMode="numeric" maxLength={1} value={values[index]} disabled={status !== "idle"} onChange={(e) => handleChange(index, e.target.value)} onKeyDown={(e) => handleKeyDown(index, e)} onPaste={handlePaste} className={cls} aria-label={`OTP digit ${index + 1}`} />
                {isActive && status === "idle" && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse" />}
                {status === "success" && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><CheckCircle2 size={24} className="text-green-500 otp-check-appear" /></div>}
              </div>
            );
          })}
        </div>
        {status === "verifying" && <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"><div className="otp-ring-loader" /></div>}
      </div>

      <div className="h-8 flex items-center justify-center w-full">
        {status === "error" && errorMsg && <div className="flex items-center gap-2 text-red-500 text-sm font-bold animate-pulse"><XCircle size={16} /> {errorMsg}</div>}
        {status === "verifying" && <p className="text-[#F5A623] text-xs font-medium tracking-wide animate-pulse">جاري التحقق...</p>}
        {status === "success" && <p className="text-green-500 text-xs font-bold tracking-wide otp-text-appear">تم التحقق بنجاح ✓</p>}
      </div>

      <style jsx global>{`
        .otp-field { color: var(--c-fg); caret-color: #F5A623; }
        .otp-verifying { animation: otpPulse 0.6s ease-in-out infinite alternate; }
        .otp-verifying:nth-child(1) { animation-delay: 0s; }
        .otp-verifying:nth-child(2) { animation-delay: 0.1s; }
        .otp-verifying:nth-child(3) { animation-delay: 0.2s; }
        .otp-verifying:nth-child(4) { animation-delay: 0.3s; }
        .otp-verifying:nth-child(5) { animation-delay: 0.4s; }
        .otp-verifying:nth-child(6) { animation-delay: 0.5s; }
        @keyframes otpPulse { 0% { opacity: 0.4; transform: scale(0.95); border-color: rgba(245,166,35,0.3); } 100% { opacity: 1; transform: scale(1.05); border-color: #F5A623; box-shadow: 0 0 16px rgba(245,166,35,0.4); } }
        .otp-success { animation: otpSuccessPop 0.4s ease-out forwards; }
        @keyframes otpSuccessPop { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); border-color: #22c55e; } }
        .otp-check-appear { animation: checkPop 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
        @keyframes checkPop { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .otp-text-appear { animation: textSlideUp 0.4s ease-out forwards; }
        @keyframes textSlideUp { 0% { transform: translateY(8px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
        .otp-error { animation: otpShake 0.4s ease-in-out; }
        @keyframes otpShake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
        .otp-spinning { animation: otpOrbit 1.2s ease-in-out infinite; }
        @keyframes otpOrbit { 0% { transform: rotate(0deg) scale(1); opacity: 1; } 25% { transform: rotate(3deg) scale(0.97); opacity: 0.85; } 50% { transform: rotate(-3deg) scale(0.95); opacity: 0.7; } 75% { transform: rotate(2deg) scale(0.97); opacity: 0.85; } 100% { transform: rotate(0deg) scale(1); opacity: 1; } }
        .otp-ring-loader { width: 120%; height: 120%; border: 3px solid transparent; border-top-color: #F5A623; border-right-color: #F5A623; border-radius: 50%; animation: ringSpin 0.8s linear infinite; position: absolute; }
        @keyframes ringSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
