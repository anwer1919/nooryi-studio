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

  // إخفاء الـ Navbar في صفحات تسجيل الدخول والتسجيل
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
    <nav className="sticky top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-gradient-to-br from-yellow-400 to-amber-600 p-2.5 rounded-2xl">
                <Music className="text-black" size={24} />
              </div>
            </div>
            <span className="text-2xl font-black tracking-tight">Nooryi</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === link.href
                    ? "text-yellow-400 bg-yellow-500/10"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {isAdmin && (
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  pathname.startsWith("/admin")
                    ? "text-yellow-400 bg-yellow-500/10"
                    : "text-yellow-400/80 hover:text-yellow-400 hover:bg-yellow-500/10"
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
                  className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/[0.08] transition-all"
                >
                  <Calendar size={16} className="text-yellow-400" />
                  <span className="text-sm font-semibold">حجوزاتي</span>
                </Link>
                
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                >
                  <LogOut size={16} />
                  <span className="text-sm font-semibold">خروج</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors"
                >
                  <LogIn size={16} />
                  تسجيل الدخول
                </Link>
                <Link 
                  href="/register"
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-xl opacity-75 group-hover:opacity-100 blur transition-all" />
                  <div className="relative bg-black px-5 py-2 rounded-xl text-sm font-bold text-white flex items-center gap-2">
                    <UserPlus size={16} />
                    ابدأ الآن
                  </div>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden py-4 border-t border-white/5 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  pathname === link.href
                    ? "text-yellow-400 bg-yellow-500/10"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-yellow-400 bg-yellow-500/10 transition-all"
              >
                <LayoutDashboard size={16} />
                لوحة التحكم
              </Link>
            )}

            <div className="pt-3 mt-3 border-t border-white/5 space-y-2">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/my-bookings"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold glass hover:bg-white/[0.08] transition-all"
                  >
                    <Calendar size={16} className="text-yellow-400" />
                    حجوزاتي
                  </Link>
                  
                  <button
                    onClick={() => {
                      setMobileOpen(false)
                      signOut({ callbackUrl: "/" })
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
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
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <LogIn size={16} />
                    تسجيل الدخول
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-yellow-500 to-amber-600 text-black transition-all"
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