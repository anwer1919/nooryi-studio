import React from "react"

interface CardProps { children: React.ReactNode; className?: string; hover?: boolean; padding?: "none" | "sm" | "md" | "lg" }

export function Card({ children, className = "", hover = false, padding = "md" }: CardProps) {
  const pad: Record<string, string> = { none: "", sm: "p-4", md: "p-6", lg: "p-8" }
  return <div className={`bg-card border border-line rounded-2xl transition-all duration-300 ${hover ? "hover:-translate-y-1 hover:shadow-lg hover:border-[#F5A623]/30" : ""} ${pad[padding]} ${className}`}>{children}</div>
}
export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <div className={`mb-4 ${className}`}>{children}</div> }
export function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <h3 className={`text-xl font-bold text-fg ${className}`}>{children}</h3> }
export function CardDescription({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <p className={`text-sm text-muted mt-1 ${className}`}>{children}</p> }