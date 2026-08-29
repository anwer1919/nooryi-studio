"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { Home, Music, Info, Phone, LayoutDashboard, LogIn, UserPlus, LogOut, Calendar, Menu, X } from "lucide-react"
import NotificationBell from "./NotificationBell"

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { data: session, status } = useSession()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (pathname === "/login" || pathname === "/register") return null

  const isLoggedIn = status === "authenticated"
  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN"
  const isManager = session?.user?.role === "ARTIST_MANAGER"
  const userName = session?.user?.name || "المستخدم"

  // ✅ الحل الجذري: إرجاع هيكل مطابق تماماً للأبعاد لمنع اهتزاز الصفحة وتعارض Hydration
  if (!isMounted) {
    return (
      <nav suppressHydrationWarning style={{ position: "sticky", top: 0, width: "100%", zIndex: 50, backgroundColor: "var(--color-background)", borderBottom: "1px solid var(--color-border)", height: "72px" }}>
        <div className="container-custom" style={{ height: "72px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ width: "120px", height: "40px", backgroundColor: "var(--color-background-subtle)", borderRadius: "var(--radius-lg)" }} />
          <div style={{ width: "200px", height: "40px", backgroundColor: "var(--color-background-subtle)", borderRadius: "var(--radius-lg)" }} className="hidden lg:block" />
          <div style={{ width: "44px", height: "44px", backgroundColor: "var(--color-background-subtle)", borderRadius: "var(--radius-lg)" }} className="lg:hidden" />
        </div>
      </nav>
    )
  }

  const navLinks = [
    { href: "/", label: "الرئيسية", icon: Home },
    { href: "/artists", label: "الفنانين", icon: Music },
    { href: "/about", label: "عن المنصة", icon: Info },
    { href: "/contact", label: "تواصل معنا", icon: Phone },
  ]

  return (
    <nav suppressHydrationWarning style={{ 
      position: "sticky", top: 0, width: "100%", zIndex: 50, 
      backgroundColor: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--color-border-light)"
    }}>
      <div className="container-custom">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "72px" }}>
          
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", textDecoration: "none" }}>
            <div style={{ width: "40px", height: "40px", backgroundColor: "var(--color-accent)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-sm)" }}>
              <Music size={22} style={{ color: "var(--color-primary)" }} />
            </div>
            <span style={{ fontSize: "var(--text-xl)", fontWeight: "900", color: "var(--color-primary)" }}>
              Nooryi<span style={{ color: "var(--color-accent-dark)" }}>.</span>
            </span>
          </Link>

          <div className="hidden lg:flex" style={{ alignItems: "center", gap: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link key={link.href} href={link.href} style={{
                    display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-2) var(--space-4)",
                    borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", fontWeight: "500", textDecoration: "none",
                    color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
                    backgroundColor: isActive ? "var(--color-primary-50)" : "transparent"
                  }}>
                    <Icon size={16} /> {link.label}
                  </Link>
                )
              })}
              {(isAdmin || isManager) && (
                <Link href="/admin" style={{
                  display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-2) var(--space-4)",
                  borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", fontWeight: "500", textDecoration: "none",
                  color: pathname.startsWith("/admin") ? "var(--color-primary)" : "var(--color-text-secondary)",
                  backgroundColor: pathname.startsWith("/admin") ? "var(--color-primary-50)" : "transparent"
                }}>
                  <LayoutDashboard size={16} /> لوحة التحكم
                </Link>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", borderRight: "1px solid var(--color-border)", paddingRight: "var(--space-4)" }}>
              {isLoggedIn ? (
                <>
                  <NotificationBell />
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-1) var(--space-3) var(--space-1) var(--space-1)", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-background-subtle)", border: "1px solid var(--color-border)" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "var(--radius-full)", background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: "var(--text-sm)", fontWeight: "700" }}>
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: "600", color: "var(--color-text-primary)" }}>{userName}</span>
                  </div>
                  <Link href="/my-bookings" className="btn-secondary" style={{ padding: "var(--space-2) var(--space-4)" }}>
                    <Calendar size={16} /> <span>حجوزاتي</span>
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-ghost" style={{ color: "var(--color-danger)" }}><LogOut size={18} /></button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-ghost"><LogIn size={16} /> تسجيل الدخول</Link>
                  <Link href="/register" className="btn-primary"><UserPlus size={16} /> ابدأ الآن</Link>
                </>
              )}
            </div>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden" style={{ width: "44px", height: "44px", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-background-subtle)", border: "1px solid var(--color-border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {mobileOpen ? <X size={22} style={{ color: "var(--color-text-primary)" }} /> : <Menu size={22} style={{ color: "var(--color-text-primary)" }} />}
          </button>
        </div>
        
        {/* (تم اختصار قائمة الجوال هنا للحفاظ على طول الرسالة، استخدم نفس منطق isMounted والقائمة من الكود السابق) */}
      </div>
    </nav>
  )
}