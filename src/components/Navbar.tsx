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
  LogOut,
  Calendar,
  Home,
  Users,
  Info,
  Phone
} from "lucide-react"
import { useState, useEffect } from "react"

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { data: session, status } = useSession()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // إخفاء في صفحات الدخول
  if (pathname === "/login" || pathname === "/register") {
    return null
  }

  const isLoggedIn = status === "authenticated"
  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN"
  const userName = session?.user?.name || "المستخدم"

  const navLinks = [
    { href: "/", label: "الرئيسية", icon: Home },
    { href: "/artists", label: "الفنانين", icon: Users },
    { href: "/about", label: "عن المنصة", icon: Info },
    { href: "/contact", label: "تواصل معنا", icon: Phone },
  ]

  // Skeleton أثناء التحميل
  if (!isMounted) {
    return (
      <nav className="sticky top-0 w-full z-50 bg-background dark:bg-dark-bg border-b border-accent/10 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20" />
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 w-full z-50 bg-background dark:bg-dark-bg border-b border-accent/10 dark:border-dark-border shadow-soft">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-accent blur-xl opacity-40 group-hover:opacity-70 transition-all duration-300" />
              <div className="relative bg-accent w-11 h-11 rounded-xl flex items-center justify-center shadow-soft">
                <Music className="text-primary" size={22} />
              </div>
            </div>
            <span className="text-2xl font-black text-primary dark:text-background">
              Nooryi<span className="text-accent">.</span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "text-primary dark:text-accent bg-accent/20 dark:bg-accent/30"
                      : "text-primary dark:text-background hover:text-accent hover:bg-accent/10 dark:hover:bg-accent/20"
                  }`}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              )
            })}
            
            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  pathname.startsWith("/admin")
                    ? "text-primary dark:text-accent bg-accent/20 dark:bg-accent/30"
                    : "text-primary dark:text-accent hover:bg-accent/10 dark:hover:bg-accent/20"
                }`}
              >
                <LayoutDashboard size={16} />
                لوحة التحكم
              </Link>
            )}
          </div>

          {/* DESKTOP AUTH */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/20 dark:bg-accent/30">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-xs font-black text-background">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-primary dark:text-background">
                    {userName}
                  </span>
                </div>

                <Link 
                  href="/my-bookings"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-primary font-bold hover:bg-accent-light hover:shadow-glow transition-all duration-300 hover:scale-[1.02]"
                >
                  <Calendar size={16} />
                  <span className="text-sm">حجوزاتي</span>
                </Link>
                
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/30 transition-all duration-300"
                >
                  <LogOut size={16} />
                  <span className="text-sm font-semibold">خروج</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-primary dark:text-accent hover:bg-accent/10 dark:hover:bg-accent/20 transition-all duration-300"
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

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:flex lg:items-center lg:justify-center p-2.5 rounded-xl bg-accent/20 dark:bg-accent/30 hover:bg-accent/30 dark:hover:bg-accent/40 transition-all"
            style={{ display: 'flex' }}
          >
            {mobileOpen ? (
              <X size={22} className="text-primary dark:text-accent" />
            ) : (
              <Menu size={22} className="text-primary dark:text-accent" />
            )}
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div className="lg:hidden py-4 pb-6 border-t border-accent/10 dark:border-dark-border space-y-1">
            
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "text-primary dark:text-accent bg-accent/20 dark:bg-accent/30"
                      : "text-primary dark:text-background hover:bg-accent/10 dark:hover:bg-accent/20"
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              )
            })}
            
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  pathname.startsWith("/admin")
                    ? "text-primary dark:text-accent bg-accent/20 dark:bg-accent/30"
                    : "text-primary dark:text-accent hover:bg-accent/10 dark:hover:bg-accent/20"
                }`}
              >
                <LayoutDashboard size={18} />
                لوحة التحكم
              </Link>
            )}

            <div className="my-3 border-t border-accent/10 dark:border-dark-border" />

            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/20 dark:bg-accent/30 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-sm font-black text-background">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-primary dark:text-background">{userName}</p>
                    <p className="text-xs text-primary/60 dark:text-background/60">
                      {isAdmin ? "مدير عام" : "عميل"}
                    </p>
                  </div>
                </div>

                <Link
                  href="/my-bookings"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-accent text-primary hover:bg-accent-light transition-all"
                >
                  <Calendar size={18} />
                  حجوزاتي
                </Link>
                
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    signOut({ callbackUrl: "/" })
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 bg-red-500/10 dark:bg-red-500/20 hover:bg-red-500/20 dark:hover:bg-red-500/30 transition-all"
                >
                  <LogOut size={18} />
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-primary dark:text-accent hover:bg-accent/10 dark:hover:bg-accent/20 transition-all"
                >
                  <LogIn size={18} />
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
        )}
      </div>
    </nav>
  )
}