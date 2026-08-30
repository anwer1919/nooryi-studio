"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { Menu, X, LogOut, Calendar, Home, Music, Info, Phone, LayoutDashboard } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { data: session, status } = useSession()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  if (pathname === "/login" || pathname === "/register") return null

  const isLoggedIn = status === "authenticated"
  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN"
  const isManager = session?.user?.role === "ARTIST_MANAGER"
  const userName = session?.user?.name || "المستخدم"

  const navLinks = [
    { href: "/", label: "الرئيسية", icon: Home },
    { href: "/artists", label: "الفنانين", icon: Music },
    { href: "/about", label: "من نحن", icon: Info },
    { href: "/contact", label: "تواصل معنا", icon: Phone },
  ]

  return (
    <nav style={{ 
      position: "sticky", 
      top: 0, 
      width: "100%", 
      zIndex: 50, 
      backgroundColor: "white",
      borderBottom: "1px solid #E5E7EB",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
    }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "64px" }}>
          
          {/* LOGO */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <div style={{ width: "32px", height: "32px", backgroundColor: "#A8D5BA", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Music size={18} style={{ color: "#4B2E83" }} />
            </div>
            <span style={{ fontSize: "20px", fontWeight: "bold", color: "#4B2E83" }}>Nooryi</span>
          </Link>

          {/* DESKTOP NAV */}
          {!isMobile && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                {navLinks.map((link) => {
                  const Icon = link.icon
                  const isActive = pathname === link.href
                  return (
                    <Link key={link.href} href={link.href} style={{
                      display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px",
                      borderRadius: "8px", fontSize: "14px", fontWeight: "500", textDecoration: "none",
                      color: isActive ? "#4B2E83" : "#6B7280",
                      backgroundColor: isActive ? "#A8D5BA40" : "transparent"
                    }}>
                      <Icon size={16} /> {link.label}
                    </Link>
                  )
                })}
                {(isAdmin || isManager) && (
                  <Link href="/admin" style={{
                    display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px",
                    borderRadius: "8px", fontSize: "14px", fontWeight: "500", textDecoration: "none",
                    color: pathname.startsWith("/admin") ? "#4B2E83" : "#6B7280",
                    backgroundColor: pathname.startsWith("/admin") ? "#A8D5BA40" : "transparent"
                  }}>
                    <LayoutDashboard size={16} /> لوحة التحكم
                  </Link>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {isLoggedIn ? (
                  <>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#4B2E83" }}>{userName}</span>
                    <Link href="/my-bookings" style={{
                      display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px",
                      borderRadius: "8px", fontSize: "14px", fontWeight: "600", textDecoration: "none",
                      backgroundColor: "#A8D5BA", color: "#4B2E83"
                    }}>
                      <Calendar size={16} /> حجوزاتي
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: "/" })} style={{
                      display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px",
                      borderRadius: "8px", fontSize: "14px", fontWeight: "600",
                      backgroundColor: "transparent", color: "#DC2626", border: "none", cursor: "pointer"
                    }}>
                      <LogOut size={16} /> خروج
                    </button>
                  </>
                ) : (
                  <Link href="/login" style={{
                    padding: "8px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: "600",
                    textDecoration: "none", backgroundColor: "#4B2E83", color: "white"
                  }}>
                    تسجيل الدخول
                  </Link>
                )}
              </div>
            </>
          )}

          {/* MOBILE MENU BUTTON */}
          {isMobile && (
            <button onClick={() => setMobileOpen(!mobileOpen)} style={{
              padding: "8px", borderRadius: "8px", backgroundColor: "transparent",
              border: "none", cursor: "pointer", color: "#6B7280"
            }}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>

        {/* MOBILE MENU */}
        {isMobile && mobileOpen && (
          <div style={{ padding: "16px 0", borderTop: "1px solid #E5E7EB" }}>
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} style={{
                  display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px",
                  borderRadius: "8px", fontSize: "16px", fontWeight: "500", textDecoration: "none",
                  color: isActive ? "#4B2E83" : "#111827",
                  backgroundColor: isActive ? "#A8D5BA40" : "transparent", marginBottom: "4px"
                }}>
                  <Icon size={20} /> {link.label}
                </Link>
              )
            })}
            
            {(isAdmin || isManager) && (
              <Link href="/admin" onClick={() => setMobileOpen(false)} style={{
                display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px",
                borderRadius: "8px", fontSize: "16px", fontWeight: "500", textDecoration: "none",
                color: "#4B2E83", backgroundColor: "#A8D5BA40", marginBottom: "4px"
              }}>
                <LayoutDashboard size={20} /> لوحة التحكم
              </Link>
            )}

            <div style={{ height: "1px", backgroundColor: "#E5E7EB", margin: "12px 0" }} />

            {isLoggedIn ? (
              <>
                <p style={{ padding: "0 16px", fontSize: "14px", fontWeight: "600", color: "#4B2E83", marginBottom: "8px" }}>{userName}</p>
                <Link href="/my-bookings" onClick={() => setMobileOpen(false)} style={{
                  display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px",
                  borderRadius: "8px", fontSize: "16px", fontWeight: "600", textDecoration: "none",
                  backgroundColor: "#A8D5BA", color: "#4B2E83", marginBottom: "8px"
                }}>
                  <Calendar size={20} /> حجوزاتي
                </Link>
                <button onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }) }} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px",
                  borderRadius: "8px", fontSize: "16px", fontWeight: "600",
                  color: "#DC2626", backgroundColor: "transparent", border: "none", cursor: "pointer"
                }}>
                  <LogOut size={20} /> تسجيل الخروج
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px 16px",
                borderRadius: "8px", fontSize: "16px", fontWeight: "600", textDecoration: "none",
                backgroundColor: "#4B2E83", color: "white"
              }}>
                تسجيل الدخول
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}