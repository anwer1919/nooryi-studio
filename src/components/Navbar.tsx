"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { 
  Music, 
  Menu, 
  X, 
  LayoutDashboard, 
  LogIn, 
  UserPlus, 
  User,
  LogOut,
  Calendar
} from "lucide-react"
import { useState } from "react"

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: session, status } = useSession()

  if (pathname === "/login" || pathname === "/register") {
    return null
  }

  const isLoggedIn = status === "authenticated"
  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN"

  const navLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "/artists", label: "الفنانين" },
    { href: "/about", label: "عن المنصة" },
    { href: "/contact", label: "تواصل معنا" },
  ]

  return (
    <nav className="sticky top-0 w-full z-50 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-xl border-b border-gray-100 dark:border-dark-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-accent blur-xl opacity-50 group-hover:opacity-75 transition-all duration-300" />
              <div className="relative bg-accent w-10 h-10 rounded-xl flex items-center justify-center shadow-glow">
                <Music className="text-primary" size={20} />
              </div>
            </div>
            <span className="text-2xl font-black text-primary dark:text-white">
              Nooryi<span className="text-accent">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  pathname === link.href
                    ? "text-primary dark:text-accent bg-accent/10 dark:bg-accent/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-accent hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {isAdmin && (
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                  pathname.startsWith("/admin")
                    ? "text-primary dark:text-accent bg-accent/10 dark:bg-accent/20"
                    : "text-primary/80 dark:text-accent/80 hover:text-primary dark:hover:text-accent hover:bg-accent/10"
                }`}
              >
                <LayoutDashboard size={16} />
                لوحة التحكم
              </Link>
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link 
                  href="/my-bookings"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-background-subtle dark:bg-dark-surface hover:bg-accent/10 dark:hover:bg-accent/20 transition-all duration-300"
                >
                  <Calendar size={16} className="text-accent" />
                  <span className="text-sm font-semibold text-primary dark:text-white">حجوزاتي</span>
                </Link>
                
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all duration-300"
                >
                  <LogOut size={16} />
                  <span className="text-sm font-semibold">خروج</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-accent transition-colors"
                >
                  <LogIn size={16} />
                  تسجيل الدخول
                </Link>
                <Link 
                  href="/register"
                  className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2"
                >
                  <UserPlus size={16} />
                  ابدأ الآن
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-background-subtle dark:bg-dark-surface hover:bg-accent/10 transition-all"
          >
            {mobileOpen ? <X size={22} className="text-primary dark:text-white" /> : <Menu size={22} className="text-primary dark:text-white" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 dark:border-dark-border space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  pathname === link.href
                    ? "text-primary dark:text-accent bg-accent/10 dark:bg-accent/20"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-primary dark:text-accent bg-accent/10 dark:bg-accent/20"
              >
                <LayoutDashboard size={16} />
                لوحة التحكم
              </Link>
            )}

            <div className="pt-3 mt-3 border-t border-gray-100 dark:border-dark-border space-y-2">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/my-bookings"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-background-subtle dark:bg-dark-surface"
                  >
                    <Calendar size={16} className="text-accent" />
                    حجوزاتي
                  </Link>
                  
                  <button
                    onClick={() => {
                      setMobileOpen(false)
                      signOut({ callbackUrl: "/" })
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10"
                  >
                    <LogOut size={16} />
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    <LogIn size={16} />
                    تسجيل الدخول
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary flex items-center justify-center gap-2 text-sm"
                  >
                    <UserPlus size={16} />
                    ابدأ الآن
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}