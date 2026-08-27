"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import UserMenu from "./UserMenu"
import NotificationBell from "./NotificationBell"
import { Music, Menu, X, LayoutDashboard } from "lucide-react"
import { useState } from "react"

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: session } = useSession()

  // إخفاء الـ Navbar في صفحات تسجيل الدخول والتسجيل
  if (pathname === "/login" || pathname === "/register") {
    return null
  }

  // التحقق من صلاحيات الأدمن
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
            
            {/* رابط لوحة التحكم - يظهر فقط للأدمن */}
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

          {/* User Actions */}
          <div className="flex items-center gap-3">
            <NotificationBell />
            <UserMenu />
            
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
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
            
            {/* رابط لوحة التحكم للموبايل */}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
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
        )}
      </div>
    </nav>
  )
}