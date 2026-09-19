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
  // استخدام refs للقيم المتغيرة لتجنب stale closures
  const statusRef = useRef<Status>("idle");
  const valuesRef = useRef<string[]>(Array(6).fill(""));

  // مزامنة الـ refs مع الـ state
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { valuesRef.current = values; }, [values]);

  // التركيز على أول حقل عند التحميل أو تغيير الإيميل
  useEffect(() => {
    setValues(Array(6).fill(""));
    setStatus("idle");
    setErrorMsg("");
    statusRef.current = "idle";
    valuesRef.current = Array(6).fill("");
    setTimeout(() => inputRefs.current[0]?.focus(), 150);
  }, [email]);

  // ═══ دالة التحقق — تُستدعى مباشرة وليس عبر useEffect ═══
  const verifyOTP = async (otp: string) => {
    console.log("[OTP] Starting verification for:", otp);
    setStatus("verifying");
    statusRef.current = "verifying";
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      console.log("[OTP] API response status:", res.status);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "رمز غير صحيح");
      }

      console.log("[OTP] Verification successful!");
      setStatus("success");
      statusRef.current = "success";

      setTimeout(() => {
        console.log("[OTP] Calling onVerified callback");
        onVerified();
      }, 1200);
    } catch (err: any) {
      console.error("[OTP] Verification failed:", err.message);
      setStatus("error");
      statusRef.current = "error";
      setErrorMsg(err.message || "رمز غير صحيح أو منتهي الصلاحية");
      setValues(Array(6).fill(""));
      valuesRef.current = Array(6).fill("");

      setTimeout(() => {
        setStatus("idle");
        statusRef.current = "idle";
        setErrorMsg("");
        inputRefs.current[0]?.focus();
      }, 1500);
    }
  };

  // ═══ التحقق من الاكتمال — يُستدعى يدوياً بعد كل تغيير ═══
  const checkAndVerify = (newValues: string[]) => {
    const otp = newValues.join("");
    console.log("[OTP] checkAndVerify:", otp, "status:", statusRef.current);
    if (otp.length === 6 && !otp.includes("") && statusRef.current === "idle") {
      verifyOTP(otp);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (statusRef.current !== "idle") return;
    if (value && !/^\d$/.test(value)) return;

    const nv = [...valuesRef.current];
    nv[index] = value;
    setValues(nv);
    valuesRef.current = nv;

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // ═══ التحقق المباشر عند اكتمال الرمز ═══
    checkAndVerify(nv);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (statusRef.current !== "idle") return;
    if (e.key === "Backspace") {
      if (valuesRef.current[index] === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const nv = [...valuesRef.current];
        nv[index] = "";
        setValues(nv);
        valuesRef.current = nv;
      }
    }
    if (e.key === "ArrowLeft" && index < 5) inputRefs.current[index + 1]?.focus();
    if (e.key === "ArrowRight" && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    if (statusRef.current !== "idle") return;
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const nv = [...valuesRef.current];
    for (let i = 0; i < pasted.length; i++) nv[i] = pasted[i];
    setValues(nv);
    valuesRef.current = nv;

    inputRefs.current[Math.min(pasted.length, 5)]?.focus();

    // ═══ التحقق المباشر بعد اللصق ═══
    checkAndVerify(nv);
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
      <div className="flex items-center justify-center gap-2 md:gap-3" dir="ltr">
        {Array.from({ length: 6 }).map((_, index) => (
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
              className={getInputClass(index)}
              aria-label={`OTP digit ${index + 1}`}
            />
            {status === "verifying" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Loader2 size={22} className="text-[#F5A623] animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <CheckCircle2 size={26} className="text-green-500 animate-bounce" />
              </div>
            )}
          </div>
        ))}
      </div>

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
