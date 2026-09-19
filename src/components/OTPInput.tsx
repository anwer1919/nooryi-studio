"use client";

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react";

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export default function OTPInput({
  length = 6,
  onComplete,
  disabled = false,
  error = false,
}: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // التركيز على أول حقل عند التحميل
  useEffect(() => {
    if (!disabled && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [disabled]);

  // استدعاء onComplete عندما تكتمل كل الحقول
  useEffect(() => {
    const otp = values.join("");
    if (otp.length === length && !otp.includes("")) {
      onComplete(otp);
    }
  }, [values, length, onComplete]);

  const handleChange = (index: number, value: string) => {
    if (disabled) return;

    // السماح فقط بالأرقام
    if (value && !/^\d$/.test(value)) return;

    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    // الانتقال للحقل التالي تلقائياً
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    // Backspace: مسح والعودة للحقل السابق
    if (e.key === "Backspace") {
      if (values[index] === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newValues = [...values];
        newValues[index] = "";
        setValues(newValues);
      }
    }

    // Arrow Left/Right للتنقل (RTL: Left = next, Right = prev)
    if (e.key === "ArrowLeft" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (e.key === "ArrowRight" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    if (disabled) return;

    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;

    const newValues = [...values];
    for (let i = 0; i < pasted.length; i++) {
      newValues[i] = pasted[i];
    }
    setValues(newValues);

    // التركيز على الحقل التالي بعد آخر رقم ملصوق
    const nextIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2 md:gap-3" dir="ltr">
      {Array.from({ length }).map((_, index) => {
        const isFilled = values[index] !== "";
        const isActive = document.activeElement === inputRefs.current[index];

        return (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={values[index]}
            disabled={disabled}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`
              w-10 h-12 md:w-14 md:h-16 text-center text-xl md:text-2xl font-bold
              rounded-lg border-2 outline-none transition-all duration-200
              ${error
                ? "border-red-500 bg-red-500/10 text-red-500 animate-shake"
                : isFilled
                  ? "border-[var(--c-orange)] bg-[var(--c-orange-dim)] text-[var(--c-fg)]"
                  : isActive
                    ? "border-[var(--c-orange)] bg-[var(--c-surface)] text-[var(--c-fg)] shadow-[0_0_0_3px_rgba(245,166,35,0.15)]"
                    : "border-[var(--c-border)] bg-[var(--c-surface)] text-[var(--c-fg)]"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-text"}
            `}
            aria-label={`OTP digit ${index + 1}`}
          />
        );
      })}

      {/* CSS Animation for error shake */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
