"use client"
import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

export default function ThemeToggle() {
  const [dark, setDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("theme")
    // Dark mode هو الافتراضي — إلا إذا اختار المستخدم light صراحة
    const isDark = stored ? stored === "dark" : true
    setDark(isDark)
    document.documentElement.classList.toggle("dark", isDark)
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem("theme", next ? "dark" : "light")
    document.documentElement.classList.toggle("dark", next)
  }

  if (!mounted) return <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-card animate-pulse" />

  return (
    <button onClick={toggle} aria-label="تبديل الوضع"
      className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center border border-[#F5A623]/20 bg-surface text-[#F5A623] hover:border-[#F5A623] hover:bg-card transition-all">
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}