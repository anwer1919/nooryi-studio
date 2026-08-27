"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { 
  LogOut, 
  LayoutDashboard, 
  Calendar,
  ChevronDown,
  Music,
  Loader2
} from "lucide-react"

export default function UserMenu() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // منع Hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // أثناء التحميل الأول، عرض skeleton بسيط
  if (!isMounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-white/5" />
    )
  }

  if (status === "loading") {
    return (
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
        <Loader2 className="animate-spin text-white/40" size={16} />
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-3">
        <Link 
          href="/login"
          className="text-sm font-semibold text-white/80 hover:text-white transition-colors"
        >
          تسجيل الدخول
        </Link>
        <Link 
          href="/register"
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-xl opacity-75 group-hover:opacity-100 blur transition-all" />
          <div className="relative bg-black px-5 py-2 rounded-xl text-sm font-bold text-white">
            ابدأ الآن
          </div>
        </Link>
      </div>
    )
  }

  const userInitial = (session.user.name || session.user.email || "U").charAt(0).toUpperCase()
  const isAdmin = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN"

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 glass rounded-full pl-2 pr-4 py-1.5 hover:bg-white/[0.08] transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center">
          <span className="text-sm font-black text-black">{userInitial}</span>
        </div>
        <span className="text-sm font-semibold hidden sm:block">{session.user.name || "مستخدم"}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute left-0 mt-2 w-56 glass rounded-2xl p-2 z-50 shadow-2xl border border-white/10">
            <div className="px-3 py-2 border-b border-white/5 mb-1">
              <p className="text-sm font-bold truncate">{session.user.name}</p>
              <p className="text-xs text-white/60 truncate">{session.user.email}</p>
            </div>

            <Link 
              href="/my-bookings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <Calendar size={16} className="text-yellow-400" />
              <span className="text-sm">حجوزاتي</span>
            </Link>

            {isAdmin && (
              <Link 
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                <LayoutDashboard size={16} className="text-yellow-400" />
                <span className="text-sm">لوحة التحكم</span>
              </Link>
            )}

            <Link 
              href="/artists"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <Music size={16} className="text-yellow-400" />
              <span className="text-sm">تصفح الفنانين</span>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors text-red-400"
            >
              <LogOut size={16} />
              <span className="text-sm font-semibold">تسجيل الخروج</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}