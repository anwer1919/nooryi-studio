"use client";

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

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
  const verifiedRef = useRef(false);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // إعادة تعيين الحالة عند تغيير الإيميل
  useEffect(() => {
    setValues(Array(6).fill(""));
    setStatus("idle");
    setErrorMsg("");
    verifiedRef.current = false;
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [email]);

  // التحقق التلقائي عند اكتمال الرمز
  useEffect(() => {
    const otp = values.join("");
    if (otp.length === 6 && !otp.includes("") && status === "idle" && !verifiedRef.current) {
      verifiedRef.current = true;
      verifyOTP(otp);
    }
  }, [values, status]);

  const verifyOTP = async (otp: string) => {
    setStatus("verifying");
    setErrorMsg("");

    try {
      // الخطوة 1: التحقق من الرمز عبر API مخصص
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "رمز غير صحيح");
      }

      // الخطوة 2: نجاح → عرض الأنيميشن ثم استدعاء callback
      setStatus("success");

      // انتظار 1.2 ثانية لعرض تأثير النجاح قبل الانتقال
      setTimeout(() => {
        onVerified();
      }, 1200);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "رمز غير صحيح أو منتهي الصلاحية");
      setValues(Array(6).fill(""));
      verifiedRef.current = false;

      // إعادة الحالة لـ idle بعد انتهاء الاهتزاز
      setTimeout(() => {
        setStatus("idle");
        setErrorMsg("");
        inputRefs.current[0]?.focus();
      }, 1500);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (status !== "idle") return;
    if (value && !/^\d$/.test(value)) return;
    const nv = [...values];
    nv[index] = value;
    setValues(nv);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (status !== "idle") return;
    if (e.key === "Backspace") {
      if (values[index] === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const nv = [...values];
        nv[index] = "";
        setValues(nv);
      }
    }
    if (e.key === "ArrowLeft" && index < 5) inputRefs.current[index + 1]?.focus();
    if (e.key === "ArrowRight" && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const nv = [...values];
    for (let i = 0; i < pasted.length; i++) nv[i] = pasted[i];
    setValues(nv);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const getInputClass = (index: number) => {
    const base =
      "w-11 h-13 md:w-14 md:h-16 text-center text-xl md:text-2xl font-bold rounded-xl border-2 outline-none transition-all duration-200 relative";

    if (status === "success")
      return `${base} border-green-500 bg-green-500/10 text-transparent scale-105`;
    if (status === "error")
      return `${base} border-red-500 bg-red-500/10 text-transparent animate-shake`;
    if (status === "verifying")
      return `${base} border-[#F5A623] bg-[#F5A623]/10 text-transparent`;

    const isFilled = values[index] !== "";
    const isActive = document.activeElement === inputRefs.current[index];
    if (isFilled)
      return `${base} border-[#F5A623] bg-[#F5A623]/10 text-[var(--c-fg)]`;
    if (isActive)
      return `${base} border-[#F5A623] bg-[var(--c-surface)] text-[var(--c-fg)] shadow-[0_0_0_3px_rgba(245,166,35,0.2)]`;
    return `${base} border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-fg)] hover:border-[#F5A623]/40`;
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* حقول OTP */}
      <div className="flex items-center justify-center gap-2 md:gap-3" dir="ltr">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="relative">
            <input
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={values[index]}
              disabled={status !== "idle"}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={getInputClass(index)}
              aria-label={`OTP digit ${index + 1}`}
            />
            {/* Spinner داخل المربع أثناء التحقق */}
            {status === "verifying" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Loader2 size={22} className="text-[#F5A623] animate-spin" />
              </div>
            )}
            {/* علامة ✓ داخل المربع عند النجاح */}
            {status === "success" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <CheckCircle2 size={26} className="text-green-500 animate-bounce" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* رسالة الخطأ */}
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
