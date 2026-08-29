"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { 
  Home, 
  Music, 
  Info, 
  Phone, 
  LayoutDashboard, 
  LogIn, 
  UserPlus,
  LogOut,
  Calendar,
  Menu,
  X,
  ChevronDown
} from "lucide-react"
import NotificationBell from "./NotificationBell"

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { data: session, status } = useSession()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (pathname === "/login" || pathname === "/register") {
    return null
  }

  const isLoggedIn = status === "authenticated"
  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN"
  const isManager = session?.user?.role === "ARTIST_MANAGER"
  const userName = session?.user?.name || "المستخدم"
  const userEmail = session?.user?.email || ""

  if (!isMounted) {
    return (
      <nav style={{ 
        position: "sticky", 
        top: 0, 
        width: "100%", 
        zIndex: 50, 
        backgroundColor: "var(--color-background)",
        borderBottom: "1px solid var(--color-border)",
        height: "72px"
      }}>
        <div className="container-custom" style={{ height: "72px" }} />
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
    <nav style={{ 
      position: "sticky", 
      top: 0, 
      width: "100%", 
      zIndex: 50, 
      backgroundColor: "rgba(255, 255, 255, 0.85)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--color-border-light)",
    }}>
      <div className="container-custom">
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          height: "72px",
          gap: "var(--space-6)"
        }}>
          
          {/* LOGO */}
          <Link href="/" style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "var(--space-3)", 
            textDecoration: "none",
            flexShrink: 0
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              backgroundColor: "var(--color-accent)",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-sm)"
            }}>
              <Music size={22} style={{ color: "var(--color-primary)" }} />
            </div>
            <span style={{ 
              fontSize: "var(--text-xl)", 
              fontWeight: "900", 
              color: "var(--color-primary)",
              letterSpacing: "-0.02em"
            }}>
              Nooryi<span style={{ color: "var(--color-accent-dark)" }}>.</span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "var(--space-1)" 
          }} className="hidden lg:flex">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    padding: "var(--space-2) var(--space-4)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--text-sm)",
                    fontWeight: "500",
                    textDecoration: "none",
                    color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
                    backgroundColor: isActive ? "var(--color-primary-50)" : "transparent",
                    transition: "all var(--transition-fast)"
                  }}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              )
            })}
            
            {(isAdmin || isManager) && (
              <Link
                href="/admin"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  padding: "var(--space-2) var(--space-4)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--text-sm)",
                  fontWeight: "500",
                  textDecoration: "none",
                  color: pathname.startsWith("/admin") ? "var(--color-primary)" : "var(--color-text-secondary)",
                  backgroundColor: pathname.startsWith("/admin") ? "var(--color-primary-50)" : "transparent",
                  transition: "all var(--transition-fast)"
                }}
              >
                <LayoutDashboard size={16} />
                لوحة التحكم
              </Link>
            )}
          </div>

          {/* DESKTOP AUTH */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "var(--space-3)" 
          }} className="hidden lg:flex">
            {isLoggedIn ? (
              <>
                {/* Notification Bell */}
                <NotificationBell />
                
                {/* User Menu */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  padding: "var(--space-1) var(--space-3) var(--space-1) var(--space-1)",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "var(--color-background-subtle)",
                  border: "1px solid var(--color-border)"
                }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "var(--radius-full)",
                    background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontSize: "var(--text-sm)",
                    fontWeight: "700"
                  }}>
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ 
                    fontSize: "var(--text-sm)", 
                    fontWeight: "600", 
                    color: "var(--color-text-primary)",
                    maxWidth: "120px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {userName}
                  </span>
                </div>

                <Link 
                  href="/my-bookings"
                  className="btn-secondary"
                  style={{ padding: "var(--space-2) var(--space-4)" }}
                >
                  <Calendar size={16} />
                  <span>حجوزاتي</span>
                </Link>
                
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="btn-ghost"
                  style={{ color: "var(--color-danger)" }}
                  title="تسجيل الخروج"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="btn-ghost"
                >
                  <LogIn size={16} />
                  تسجيل الدخول
                </Link>
                
                <Link 
                  href="/register"
                  className="btn-primary"
                >
                  <UserPlus size={16} />
                  ابدأ الآن
                </Link>
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }} className="lg:hidden">
            {isLoggedIn && <NotificationBell />}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius-lg)",
                backgroundColor: "var(--color-background-subtle)",
                border: "1px solid var(--color-border)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-text-primary)"
              }}
              aria-label="القائمة"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div 
            className="animate-fade-in lg:hidden"
            style={{
              padding: "var(--space-4) 0 var(--space-6)",
              borderTop: "1px solid var(--color-border-light)"
            }}
          >
            {/* User Card (if logged in) */}
            {isLoggedIn && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                padding: "var(--space-4)",
                borderRadius: "var(--radius-xl)",
                background: "linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-accent-50) 100%)",
                marginBottom: "var(--space-4)",
                border: "1px solid var(--color-border-light)"
              }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "var(--radius-full)",
                  background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontSize: "var(--text-lg)",
                  fontWeight: "700",
                  flexShrink: 0
                }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ 
                    fontSize: "var(--text-base)", 
                    fontWeight: "700", 
                    color: "var(--color-text-primary)",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {userName}
                  </p>
                  <p style={{ 
                    fontSize: "var(--text-xs)", 
                    color: "var(--color-text-secondary)",
                    margin: "2px 0 0 0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {userEmail}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div style={{ marginBottom: "var(--space-4)" }}>
              <p style={{
                fontSize: "var(--text-xs)",
                fontWeight: "600",
                color: "var(--color-text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                padding: "0 var(--space-4)",
                marginBottom: "var(--space-2)"
              }}>
                القائمة
              </p>
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                      padding: "var(--space-3) var(--space-4)",
                      borderRadius: "var(--radius-lg)",
                      fontSize: "var(--text-base)",
                      fontWeight: "500",
                      textDecoration: "none",
                      color: isActive ? "var(--color-primary)" : "var(--color-text-primary)",
                      backgroundColor: isActive ? "var(--color-primary-50)" : "transparent",
                      marginBottom: "2px",
                      transition: "all var(--transition-fast)"
                    }}
                  >
                    <Icon size={20} style={{ color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)" }} />
                    {link.label}
                  </Link>
                )
              })}
              
              {(isAdmin || isManager) && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    padding: "var(--space-3) var(--space-4)",
                    borderRadius: "var(--radius-lg)",
                    fontSize: "var(--text-base)",
                    fontWeight: "500",
                    textDecoration: "none",
                    color: pathname.startsWith("/admin") ? "var(--color-primary)" : "var(--color-text-primary)",
                    backgroundColor: pathname.startsWith("/admin") ? "var(--color-primary-50)" : "transparent"
                  }}
                >
                  <LayoutDashboard size={20} style={{ color: pathname.startsWith("/admin") ? "var(--color-primary)" : "var(--color-text-secondary)" }} />
                  لوحة التحكم
                </Link>
              )}
            </div>

            {/* Divider */}
            <div style={{
              height: "1px",
              backgroundColor: "var(--color-border-light)",
              margin: "var(--space-2) 0"
            }} />

            {/* Auth Actions */}
            {isLoggedIn ? (
              <div style={{ padding: "0 var(--space-2)" }}>
                <Link
                  href="/my-bookings"
                  onClick={() => setMobileOpen(false)}
                  className="btn-secondary"
                  style={{ 
                    width: "100%", 
                    justifyContent: "center",
                    marginBottom: "var(--space-2)",
                    padding: "var(--space-3)"
                  }}
                >
                  <Calendar size={18} />
                  حجوزاتي
                </Link>
                
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    signOut({ callbackUrl: "/" })
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "var(--space-2)",
                    padding: "var(--space-3)",
                    borderRadius: "var(--radius-lg)",
                    fontSize: "var(--text-base)",
                    fontWeight: "600",
                    color: "var(--color-danger)",
                    backgroundColor: "#FEE2E2",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  <LogOut size={18} />
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <div style={{ padding: "0 var(--space-2)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-ghost"
                  style={{ 
                    justifyContent: "center",
                    border: "1px solid var(--color-border)",
                    padding: "var(--space-3)"
                  }}
                >
                  <LogIn size={18} />
                  تسجيل الدخول
                </Link>
                
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary"
                  style={{ 
                    justifyContent: "center",
                    padding: "var(--space-3)"
                  }}
                >
                  <UserPlus size={18} />
                  ابدأ الآن
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}