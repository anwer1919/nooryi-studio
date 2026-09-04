"use client"

import { useState, useEffect } from "react"
import { Sun, Moon } from "lucide-react"

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const initial = saved ? saved === "dark" : prefersDark
    setIsDark(initial)
    document.documentElement.classList.toggle("dark", initial)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    document.documentElement.classList.toggle("dark", newTheme)
    localStorage.setItem("theme", newTheme ? "dark" : "light")
  }

  if (!mounted) {
    return (
      <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 border border-white/10">
        <Sun size={18} className="text-[#D4AF37]" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 transition-all duration-300 group"
      aria-label={isDark ? "التبديل للوضع النهاري" : "التبديل للوضع الليلي"}
      title={isDark ? "الوضع النهاري" : "الوضع الليلي"}
    >
      {isDark ? (
        <Sun size={18} className="text-[#D4AF37] group-hover:rotate-45 transition-transform duration-300" />
      ) : (
        <Moon size={18} className="text-[#D4AF37] group-hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  )
}