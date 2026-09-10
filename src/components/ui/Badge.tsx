import React from "react"

interface BadgeProps { variant?: "success" | "error" | "warning" | "info" | "accent"; children: React.ReactNode; className?: string }

export function Badge({ variant = "accent", children, className = "" }: BadgeProps) {
  const v: Record<string, string> = { success: "badge-success", error: "badge-error", warning: "badge-warning", info: "badge-info", accent: "badge-accent" }
  return <span className={`badge ${v[variant]} ${className}`}>{children}</span>
}