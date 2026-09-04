"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import NavbarClient from "./NavbarClient"
import NotificationBell from "./NotificationBell"
import ThemeToggle from "./ThemeToggle"

export default function Navbar() {
  const [session, setSession] = useState<any>(null)
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading")
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        setSession(data)
        setStatus(data?.user ? "authenticated" : "unauthenticated")
      })
      .catch(() => setStatus("unauthenticated"))
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const hideOnPaths = ["/admin", "/login", "/register", "/booking", "/kage"]
  const shouldHide = hideOnPaths.some((p) => pathname.startsWith(p))
  if (shouldHide) return null

  if (status === "loading") {
    return (
      <nav className="fixed top-0 left-0 right-0 z-[9999] bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-[#d4af37]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="w-32 h-8 bg-white/10 rounded-lg animate-pulse" />
          <div className="w-40 h-10 bg-white/10 rounded-full animate-pulse" />
        </div>
      </nav>
    )
  }

  const isLoggedIn = !!session?.user
  const userName = session?.user?.name || "مستخدم"
  const userEmail = session?.user?.email || ""
  const userRole = session?.user?.role || "CLIENT"
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"

  const user = session?.user ? {
    name: userName,
    email: userEmail,
    role: userRole,
    isAdmin,
  } : null

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-500 ${
        scrolled
          ? "bg-[#0a0a0a]/98 backdrop-blur-xl shadow-2xl shadow-[#d4af37]/5 border-b border-[#d4af37]/20"
          : "bg-[#0a0a0a]/90 backdrop-blur-lg border-b border-white/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* الشعار */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#b8941f] flex items-center justify-center shadow-lg shadow-[#d4af37]/20 group-hover:shadow-[#d4af37]/40 transition-all duration-300">
              <span className="text-[#0a0a0a] text-lg font-black">N</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-white leading-tight">Nooryi</span>
              <span className="text-[9px] text-[#d4af37] font-bold tracking-[0.25em] uppercase leading-tight">Studio</span>
            </div>
          </Link>

          {/* روابط سطح المكتب */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                pathname === "/"
                  ? "text-[#d4af37] bg-[#d4af37]/10"
                  : "text-white/70 hover:text-[#d4af37] hover:bg-white/5"
              }`}
            >
              الرئيسية
            </Link>
            <Link
              href="/artists"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                pathname.startsWith("/artists")
                  ? "text-[#d4af37] bg-[#d4af37]/10"
                  : "text-white/70 hover:text-[#d4af37] hover:bg-white/5"
              }`}
            >
              الفنانين
            </Link>
            {isLoggedIn && (
              <Link
                href="/my-bookings"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  pathname === "/my-bookings"
                    ? "text-[#d4af37] bg-[#d4af37]/10"
                    : "text-white/70 hover:text-[#d4af37] hover:bg-white/5"
                }`}
              >
                حجوزاتي
              </Link>
            )}
          </div>

          {/* قسم المستخدم (سطح المكتب) */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <ThemeToggle />
                <NotificationBell />
                <NavbarClient user={user} mode="desktop" />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-5 py-2 text-white/80 border border-white/20 rounded-xl font-bold hover:border-[#d4af37] hover:text-[#d4af37] transition-all duration-300 text-sm"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#0a0a0a] rounded-xl font-black hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all duration-300 text-sm"
                >
                  حساب جديد
                </Link>
              </div>
            )}
          </div>

          {/* قسم الجوال */}
          <div className="md:hidden flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <ThemeToggle />
                <ThemeToggle />
                <NotificationBell />
                <NavbarClient user={user} mode="mobile" />
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-[#d4af37] font-bold text-sm border border-[#d4af37]/30 rounded-xl hover:bg-[#d4af37]/10 transition-all duration-300"
              >
                دخول
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}