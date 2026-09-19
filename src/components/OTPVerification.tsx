"use client";

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface OTPVerificationProps {
  email: string;
  method?: "email" | "whatsapp";
  redirectOnSuccess?: string;
  onVerified?: () => void;
}

type Status = "idle" | "verifying" | "success" | "error";

export default function OTPVerification({
  email,
  method = "email",
  redirectOnSuccess = "/admin",
  onVerified,
}: OTPVerificationProps) {
  const router = useRouter();
  const [values, setValues] = useState<string[]>(Array(6).fill(""));
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // التركيز على أول حقل
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // التحقق التلقائي عند اكتمال الرمز
  useEffect(() => {
    const otp = values.join("");
    if (otp.length === 6 && !otp.includes("") && status === "idle") {
      verifyOTP(otp);
    }
  }, [values]);

  const verifyOTP = async (otp: string) => {
    setStatus("verifying");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (res.ok) {
        setStatus("success");
        // انتظار قصير لعرض تأثير النجاح قبل التوجيه
        setTimeout(() => {
          if (onVerified) {
            onVerified();
          } else {
            router.push(redirectOnSuccess);
            router.refresh();
          }
        }, 1200);
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setErrorMsg(data.error || "رمز غير صحيح");
        setValues(Array(6).fill(""));
        inputRefs.current[0]?.focus();
        // إعادة الحالة لـ idle بعد انتهاء الاهتزاز
        setTimeout(() => {
          setStatus("idle");
          setErrorMsg("");
        }, 1500);
      }
    } catch {
      setStatus("error");
      setErrorMsg("حدث خطأ في الاتصال");
      setTimeout(() => {
        setStatus("idle");
        setErrorMsg("");
      }, 1500);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (status !== "idle") return;
    if (value && !/^\d$/.test(value)) return;

    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (status !== "idle") return;

    if (e.key === "Backspace") {
      if (values[index] === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newValues = [...values];
        newValues[index] = "";
        setValues(newValues);
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

    const newValues = [...values];
    for (let i = 0; i < pasted.length; i++) newValues[i] = pasted[i];
    setValues(newValues);

    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  // ═══ ألوان الحقول حسب الحالة ═══
  const getInputClass = (index: number) => {
    const base =
      "w-10 h-12 md:w-14 md:h-16 text-center text-xl md:text-2xl font-bold rounded-lg border-2 outline-none transition-all duration-200";

    if (status === "success") {
      return `${base} border-green-500 bg-green-500/10 text-green-500 scale-105`;
    }
    if (status === "error") {
      return `${base} border-red-500 bg-red-500/10 text-red-500 animate-shake`;
    }
    if (status === "verifying") {
      return `${base} border-[var(--c-orange)] bg-[var(--c-orange-dim)] text-[var(--c-fg)] opacity-70`;
    }

    // idle state
    const isFilled = values[index] !== "";
    const isActive = document.activeElement === inputRefs.current[index];

    if (isFilled) return `${base} border-[var(--c-orange)] bg-[var(--c-orange-dim)] text-[var(--c-fg)]`;
    if (isActive)
      return `${base} border-[var(--c-orange)] bg-[var(--c-surface)] text-[var(--c-fg)] shadow-[0_0_0_3px_rgba(245,166,35,0.15)]`;
    return `${base} border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-fg)]`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* حقول OTP */}
      <div className="flex items-center justify-center gap-2 md:gap-3" dir="ltr">
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            key={index}
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
        ))}
      </div>

      {/* رسائل الحالة */}
      <div className="h-8 flex items-center justify-center">
        {status === "verifying" && (
          <div className="flex items-center gap-2 text-[var(--c-orange)] text-sm font-medium animate-pulse">
            <Loader2 size={16} className="animate-spin" />
            جاري التحقق...
          </div>
        )}

        {status === "success" && (
          <div className="flex items-center gap-2 text-green-500 text-sm font-bold animate-bounce">
            <CheckCircle2 size={18} />
            تم التحقق بنجاح! جاري التحويل...
          </div>
        )}

        {status === "error" && errorMsg && (
          <div className="flex items-center gap-2 text-red-500 text-sm font-bold">
            <XCircle size={18} />
            {errorMsg}
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          20% {
            transform: translateX(-6px);
          }
          40% {
            transform: translateX(6px);
          }
          60% {
            transform: translateX(-6px);
          }
          80% {
            transform: translateX(6px);
          }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
