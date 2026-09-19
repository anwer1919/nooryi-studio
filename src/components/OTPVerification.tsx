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

      setStatus("success");
      // انتظار الأنيميشن ثم استدعاء callback
      setTimeout(() => onVerified(), 1800);
    } catch (err: any) {
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
      {/* ═══ حقول OTP بأسلوب otp_animated_fields ═══ */}
      <div className="flex items-center justify-center gap-1 md:gap-2" dir="ltr">
        {Array.from({ length: 6 }).map((_, index) => {
          const isFilled = values[index] !== "";
          const isActive = document.activeElement === inputRefs.current[index];

          return (
            <div key={index} className="relative group">
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
                className={`
                  otp-field
                  w-10 h-12 md:w-14 md:h-16
                  text-center text-xl md:text-2xl font-bold
                  bg-transparent border-b-[3px] outline-none
                  transition-all duration-300 ease-out
                  ${status === "verifying" ? "otp-verifying" : ""}
                  ${status === "success" ? "otp-success" : ""}
                  ${status === "error" ? "otp-error" : ""}
                  ${isActive && status === "idle" ? "otp-active" : ""}
                  ${isFilled && status === "idle" ? "otp-filled" : ""}
                  ${!isFilled && !isActive && status === "idle" ? "otp-empty" : ""}
                `}
                aria-label={`OTP digit ${index + 1}`}
              />

              {/* نقطة مضيئة أسفل الحقل النشط */}
              {isActive && status === "idle" && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse" />
              )}

              {/* ✓ عند النجاح */}
              {status === "success" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <CheckCircle2 size={24} className="text-green-500 otp-check-appear" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* رسائل الحالة */}
      <div className="h-8 flex items-center justify-center w-full">
        {status === "error" && errorMsg && (
          <div className="flex items-center gap-2 text-red-500 text-sm font-bold animate-pulse">
            <XCircle size={16} /> {errorMsg}
          </div>
        )}
        {status === "verifying" && (
          <p className="text-[#F5A623] text-xs font-medium tracking-wide animate-pulse">
            جاري التحقق...
          </p>
        )}
        {status === "success" && (
          <p className="text-green-500 text-xs font-bold tracking-wide otp-text-appear">
            تم التحقق بنجاح ✓
          </p>
        )}
      </div>

      {/* ═══ CSS Animations ═══ */}
      <style jsx global>{`
        /* الخط الأساسي للحقول */
        .otp-field {
          color: var(--c-fg);
          caret-color: #F5A623;
        }

        /* الحالة الفارغة */
        .otp-empty {
          border-color: rgba(255, 255, 255, 0.15);
        }

        /* الحالة المملوءة */
        .otp-filled {
          border-color: #F5A623;
          color: var(--c-fg);
        }

        /* الحالة النشطة (تركيز) */
        .otp-active {
          border-color: #F5A623;
          box-shadow: 0 4px 12px rgba(245, 166, 35, 0.2);
          transform: translateY(-2px);
        }

        /* حالة التحقق — نبض متتابع */
        .otp-verifying {
          border-color: #F5A623;
          animation: otpPulse 0.6s ease-in-out infinite alternate;
        }
        .otp-verifying:nth-child(1) { animation-delay: 0s; }
        .otp-verifying:nth-child(2) { animation-delay: 0.1s; }
        .otp-verifying:nth-child(3) { animation-delay: 0.2s; }
        .otp-verifying:nth-child(4) { animation-delay: 0.3s; }
        .otp-verifying:nth-child(5) { animation-delay: 0.4s; }
        .otp-verifying:nth-child(6) { animation-delay: 0.5s; }

        @keyframes otpPulse {
          0% { opacity: 0.4; transform: scale(0.95); border-color: rgba(245, 166, 35, 0.3); }
          100% { opacity: 1; transform: scale(1.05); border-color: #F5A623; box-shadow: 0 0 16px rgba(245, 166, 35, 0.4); }
        }

        /* حالة النجاح */
        .otp-success {
          border-color: #22c55e;
          animation: otpSuccessPop 0.4s ease-out forwards;
        }

        @keyframes otpSuccessPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); border-color: #22c55e; }
        }

        /* ظهور علامة ✓ */
        .otp-check-appear {
          animation: checkPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes checkPop {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        /* ظهور نص النجاح */
        .otp-text-appear {
          animation: textSlideUp 0.4s ease-out forwards;
        }
        @keyframes textSlideUp {
          0% { transform: translateY(8px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        /* حالة الخطأ */
        .otp-error {
          border-color: #ef4444;
          animation: otpShake 0.4s ease-in-out;
        }

        @keyframes otpShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
