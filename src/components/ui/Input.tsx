"use client"
import React, { forwardRef } from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, icon, className = "", ...props }, ref) => {
  return (
    <div className="space-y-2">
      {label && <label className="input-label">{label}{props.required && <span className="text-[#F5A623] mr-1">*</span>}</label>}
      <div className="relative">
        {icon && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">{icon}</div>}
        <input ref={ref} className={`input-field ${icon ? "pr-10" : ""} ${error ? "error" : ""} ${className}`} {...props} />
      </div>
      {error && <p className="input-error">{error}</p>}
    </div>
  )
})
Input.displayName = "Input"