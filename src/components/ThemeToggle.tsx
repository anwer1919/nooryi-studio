"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    const isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  if (!mounted) return <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 animate-pulse" />;

  return (
    <button
      onClick={toggle}
      aria-label="تبديل الوضع الليلي"
      className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-[#d4af37] hover:border-[#d4af37] hover:text-[#d4af37] transition-all"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}