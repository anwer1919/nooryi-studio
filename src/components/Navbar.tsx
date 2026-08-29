"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"

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

  if (!isMounted) {
    return (
      <nav style={{ 
        position: "sticky", 
        top: 0, 
        width: "100%", 
        zIndex: 50, 
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E5E7EB",
        height: "80px"
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", height: "80px" }} />
      </nav>
    )
  }

  const navLinks = [
    { href: "/", label: "الرئيسية", icon: "🏠" },
    { href: "/artists", label: "الفنانين", icon: "🎵" },
    { href: "/about", label: "عن المنصة", icon: "ℹ️" },
    { href: "/contact", label: "تواصل معنا", icon: "📞" },
  ]

  return (
    <nav style={{ 
      position: "sticky", 
      top: 0, 
      width: "100%", 
      zIndex: 50, 
      backgroundColor: "#FFFFFF",
      borderBottom: "1px solid #E5E7EB",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
    }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          height: "80px" 
        }}>
          
          {/* LOGO */}
          <Link href="/" style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px", 
            textDecoration: "none" 
          }}>
            <div style={{
              width: "44px",
              height: "44px",
              backgroundColor: "#A8D5BA",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: "bold",
              color: "#4B2E83",
              boxShadow: "0 4px 12px rgba(168, 213, 186, 0.3)"
            }}>
              🎵
            </div>
            <span style={{ 
              fontSize: "24px", 
              fontWeight: "900", 
              color: "#4B2E83" 
            }}>
              Nooryi<span style={{ color: "#A8D5BA" }}>.</span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px" 
          }} className="hidden lg:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "600",
                    textDecoration: "none",
                    color: isActive ? "#4B2E83" : "#374151",
                    backgroundColor: isActive ? "#A8D5BA40" : "transparent",
                    transition: "all 0.3s"
                  }}
                >
                  {link.label}
                </Link>
              )
            })}
            
            {(isAdmin || isManager) && (
              <Link
                href="/admin"
                style={{
                  padding: "10px 16px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "600",
                  textDecoration: "none",
                  color: "#4B2E83",
                  backgroundColor: pathname.startsWith("/admin") ? "#A8D5BA40" : "transparent"
                }}
              >
                📊 لوحة التحكم
              </Link>
            )}
          </div>

          {/* DESKTOP AUTH BUTTONS */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px" 
          }} className="hidden lg:flex">
            {isLoggedIn ? (
              <>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  borderRadius: "12px",
                  backgroundColor: "#A8D5BA40"
                }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    backgroundColor: "#4B2E83",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: "900"
                  }}>
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ 
                    fontSize: "14px", 
                    fontWeight: "600", 
                    color: "#4B2E83" 
                  }}>
                    {userName}
                  </span>
                </div>

                <Link 
                  href="/my-bookings"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    borderRadius: "12px",
                    backgroundColor: "#A8D5BA",
                    color: "#4B2E83",
                    fontSize: "14px",
                    fontWeight: "700",
                    textDecoration: "none",
                    transition: "all 0.3s"
                  }}
                >
                  📅 حجوزاتي
                </Link>
                
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    borderRadius: "12px",
                    backgroundColor: "#FEE2E2",
                    color: "#DC2626",
                    fontSize: "14px",
                    fontWeight: "600",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                >
                  🚪 خروج
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    borderRadius: "12px",
                    color: "#4B2E83",
                    fontSize: "14px",
                    fontWeight: "600",
                    textDecoration: "none"
                  }}
                >
                  🔑 تسجيل الدخول
                </Link>
                
                <Link 
                  href="/register"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 20px",
                    borderRadius: "12px",
                    backgroundColor: "#4B2E83",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontWeight: "700",
                    textDecoration: "none",
                    transition: "all 0.3s"
                  }}
                >
                  ✨ ابدأ الآن
                </Link>
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              padding: "12px",
              borderRadius: "12px",
              backgroundColor: "#A8D5BA40",
              border: "none",
              cursor: "pointer",
              fontSize: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s"
            }}
            className="lg:hidden"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* MOBILE MENU - تصميم احترافي */}
        {mobileOpen && (
          <div style={{
            paddingTop: "20px",
            paddingBottom: "24px",
            borderTop: "1px solid #E5E7EB"
          }} className="lg:hidden">
            
            {/* روابط التنقل */}
            <div style={{ marginBottom: "16px" }}>
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      fontSize: "15px",
                      fontWeight: "600",
                      textDecoration: "none",
                      color: isActive ? "#4B2E83" : "#374151",
                      backgroundColor: isActive ? "#A8D5BA40" : "transparent",
                      marginBottom: "4px",
                      transition: "all 0.3s"
                    }}
                  >
                    <span style={{ fontSize: "18px" }}>{link.icon}</span>
                    {link.label}
                  </Link>
                )
              })}
            </div>

            {/* لوحة التحكم للأدمن */}
            {(isAdmin || isManager) && (
              <div style={{ marginBottom: "16px" }}>
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    fontSize: "15px",
                    fontWeight: "600",
                    textDecoration: "none",
                    color: "#4B2E83",
                    backgroundColor: pathname.startsWith("/admin") ? "#A8D5BA40" : "transparent"
                  }}
                >
                  <span style={{ fontSize: "18px" }}>📊</span>
                  لوحة التحكم
                </Link>
              </div>
            )}

            {/* فاصل */}
            <div style={{
              margin: "16px 0",
              borderTop: "1px solid #E5E7EB"
            }} />

            {/* معلومات المستخدم والأزرار */}
            {isLoggedIn ? (
              <>
                {/* بطاقة المستخدم */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "16px",
                  borderRadius: "12px",
                  backgroundColor: "#A8D5BA40",
                  marginBottom: "12px"
                }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    backgroundColor: "#4B2E83",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontSize: "18px",
                    fontWeight: "900"
                  }}>
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ 
                      fontSize: "16px", 
                      fontWeight: "700", 
                      color: "#4B2E83",
                      margin: 0
                    }}>
                      {userName}
                    </p>
                    <p style={{ 
                      fontSize: "13px", 
                      color: "#6B7280",
                      margin: 0
                    }}>
                      {isAdmin ? "مدير عام" : isManager ? "مدير أعمال" : "عميل"}
                    </p>
                  </div>
                </div>

                {/* زر حجوزاتي */}
                <Link
                  href="/my-bookings"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    fontSize: "15px",
                    fontWeight: "700",
                    textDecoration: "none",
                    color: "#4B2E83",
                    backgroundColor: "#A8D5BA",
                    marginBottom: "8px",
                    transition: "all 0.3s"
                  }}
                >
                  📅 حجوزاتي
                </Link>
                
                {/* زر خروج */}
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
                    gap: "10px",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#DC2626",
                    backgroundColor: "#FEE2E2",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                >
                  🚪 تسجيل الخروج
                </button>
              </>
            ) : (
              <>
                {/* زر تسجيل الدخول */}
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    fontSize: "15px",
                    fontWeight: "600",
                    textDecoration: "none",
                    color: "#4B2E83",
                    backgroundColor: "#F8F9FC",
                    marginBottom: "8px",
                    transition: "all 0.3s"
                  }}
                >
                  🔑 تسجيل الدخول
                </Link>
                
                {/* زر ابدأ الآن */}
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    fontSize: "15px",
                    fontWeight: "700",
                    textDecoration: "none",
                    color: "#FFFFFF",
                    backgroundColor: "#4B2E83",
                    transition: "all 0.3s"
                  }}
                >
                  ✨ ابدأ الآن
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}