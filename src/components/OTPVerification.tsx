"use client";

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react";
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
    console.log("[OTP] 🔥 VERIFY:", otp);
    isVerifyingRef.current = true;
    setStatus("verifying");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "رمز غير صحيح");
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
    const result: string[] = [];
    for (let i = 0; i < 6; i++) result[i] = i === index ? value : current[i];
    return result;
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
    <div className="flex flex-col items-center gap-4 w-full">
      {/* حاوية الحقول مع أنيميشن الدوران */}
      <div className={`relative ${status === "verifying" ? "otp-spinning" : ""}`}>
        <div className="flex items-center justify-center gap-2 md:gap-3" dir="ltr">
          {Array.from({ length: 6 }).map((_, index) => {
            const isFilled = values[index] !== "";
            const isActive = document.activeElement === inputRefs.current[index];

            let boxClass =
              "w-11 h-13 md:w-14 md:h-16 text-center text-xl md:text-2xl font-bold rounded-xl border-2 outline-none transition-all duration-200 relative ";

            if (status === "success")
              boxClass += "border-green-500 bg-green-500/10 text-transparent scale-105";
            else if (status === "error")
              boxClass += "border-red-500 bg-red-500/10 text-transparent animate-shake";
            else if (status === "verifying")
              boxClass += "border-[#F5A623] bg-[#F5A623]/10 text-[var(--c-fg)]";
            else if (isFilled)
              boxClass += "border-[#F5A623] bg-[#F5A623]/10 text-[var(--c-fg)]";
            else if (isActive)
              boxClass += "border-[#F5A623] bg-[var(--c-surface)] text-[var(--c-fg)] shadow-[0_0_0_3px_rgba(245,166,35,0.2)]";
            else
              boxClass += "border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-fg)] hover:border-[#F5A623]/40";

            return (
              <div key={index} className="relative">
                <input
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={values[index]}
                  disabled={status !== "idle"}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={boxClass}
                  aria-label={`OTP digit ${index + 1}`}
                />
                {/* ✓ عند النجاح */}
                {status === "success" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <CheckCircle2 size={26} className="text-green-500 animate-bounce" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* طبقة التحميل الدائرية فوق المربعات أثناء التحقق */}
        {status === "verifying" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="otp-ring-loader" />
          </div>
        )}
      </div>

      {/* رسائل الحالة */}
      <div className="h-8 flex items-center justify-center w-full">
        {status === "error" && errorMsg && (
          <div className="flex items-center gap-2 text-red-500 text-sm font-bold animate-pulse">
            <XCircle size={16} /> {errorMsg}
          </div>
        )}
        {status === "verifying" && (
          <p className="text-[#F5A623] text-xs font-medium animate-pulse">جاري التحقق...</p>
        )}
        {status === "success" && (
          <p className="text-green-500 text-xs font-bold animate-pulse">تم التحقق بنجاح!</p>
        )}
      </div>

      <style jsx>{`
        /* ═══ أنيميشن دوران المربعات حول بعضها ═══ */
        .otp-spinning {
          animation: otpOrbit 1.2s ease-in-out infinite;
        }

        @keyframes otpOrbit {
          0% { transform: rotate(0deg) scale(1); opacity: 1; }
          25% { transform: rotate(3deg) scale(0.97); opacity: 0.85; }
          50% { transform: rotate(-3deg) scale(0.95); opacity: 0.7; }
          75% { transform: rotate(2deg) scale(0.97); opacity: 0.85; }
          100% { transform: rotate(0deg) scale(1); opacity: 1; }
        }

        /* ═══ حلقة التحميل الدائرية ═══ */
        .otp-ring-loader {
          width: 120%;
          height: 120%;
          border: 3px solid transparent;
          border-top-color: #F5A623;
          border-right-color: #F5A623;
          border-radius: 50%;
          animation: ringSpin 0.8s linear infinite;
          position: absolute;
        }

        @keyframes ringSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* ═══ اهتزاز الخطأ ═══ */
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}
