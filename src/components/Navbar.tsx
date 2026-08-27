"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import UserMenu from "./UserMenu"
import NotificationBell from "./NotificationBell"
import { Music, Menu, X } from "lucide-react"
import { useState } from "react"

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // إخفاء الـ Navbar في صفحات تسجيل الدخول والتسجيل
  if (pathname === "/login" || pathname === "/register") {
    return null
  }

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
          </div>

          {/* User Actions (على اليسار بصرياً في RTL) */}
          <div className="flex items-center gap-3">
            {/* جرس الإشعارات */}
            <NotificationBell />
            
            {/* قائمة المستخدم */}
            <UserMenu />
            
            {/* Mobile Menu Button */}
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
          </div>
        )}
      </div>
    </nav>
  )
}