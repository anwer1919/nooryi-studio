"use client"
import React from "react"
import { Loader2 } from "lucide-react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  icon?: React.ReactNode
}

export function Button({ children, variant = "primary", size = "md", loading = false, icon, disabled, className = "", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
  const variants: Record<string, string> = {
    primary: "bg-[#F5A623] text-fg hover:bg-[#E8961A] hover:shadow-[0_8px_24px_rgba(245,166,35,0.3)]",
    secondary: "bg-transparent border-2 border-line text-fg hover:border-[#F5A623] hover:text-[#F5A623]",
    ghost: "bg-transparent text-fg hover:bg-card",
  }
  const sizes: Record<string, string> = { sm: "px-3 py-2 text-sm", md: "px-5 py-3 text-base", lg: "px-6 py-4 text-lg" }
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled || loading} {...props}>
      {loading ? <><Loader2 className="animate-spin" size={size === "sm" ? 14 : 16} /><span>جاري التحميل...</span></> : <>{icon}{children}</>}
    </button>
  )
}