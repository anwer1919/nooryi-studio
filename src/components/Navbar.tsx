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

  // إخفاء في صفحات الدخول
  if (pathname === "/login" || pathname === "/register") {
    return null
  }

  const isLoggedIn = status === "authenticated"
  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN"
  const userName = session?.user?.name || "المستخدم"

  // Skeleton أثناء التحميل
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
    { href: "/", label: "الرئيسية" },
    { href: "/artists", label: "الفنانين" },
    { href: "/about", label: "عن المنصة" },
    { href: "/contact", label: "تواصل معنا" },
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
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
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
              color: "#4B2E83"
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

          {/* DESKTOP NAV - يظهر فقط على الشاشات الكبيرة */}
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
            
            {isAdmin && (
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
                {/* اسم المستخدم */}
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

                {/* زر حجوزاتي */}
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
                    textDecoration: "none"
                  }}
                >
                  📅 حجوزاتي
                </Link>
                
                {/* زر خروج */}
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
                    cursor: "pointer"
                  }}
                >
                  🚪 خروج
                </button>
              </>
            ) : (
              <>
                {/* زر تسجيل الدخول */}
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
                
                {/* زر ابدأ الآن */}
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
                    textDecoration: "none"
                  }}
                >
                  ✨ ابدأ الآن
                </Link>
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON - يظهر دائماً */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              padding: "10px",
              borderRadius: "12px",
              backgroundColor: "#A8D5BA40",
              border: "none",
              cursor: "pointer",
              fontSize: "22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            className="lg:hidden"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div style={{
            paddingTop: "16px",
            paddingBottom: "24px",
            borderTop: "1px solid #E5E7EB"
          }} className="lg:hidden">
            
            {/* روابط التنقل */}
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
                    padding: "12px 16px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "600",
                    textDecoration: "none",
                    color: isActive ? "#4B2E83" : "#374151",
                    backgroundColor: isActive ? "#A8D5BA40" : "transparent",
                    marginBottom: "4px"
                  }}
                >
                  {link.label}
                </Link>
              )
            })}
            
            {/* لوحة التحكم للأدمن */}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "600",
                  textDecoration: "none",
                  color: "#4B2E83",
                  backgroundColor: pathname.startsWith("/admin") ? "#A8D5BA40" : "transparent",
                  marginBottom: "4px"
                }}
              >
                📊 لوحة التحكم
              </Link>
            )}

            {/* فاصل */}
            <div style={{
              margin: "12px 0",
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
                  padding: "12px 16px",
                  borderRadius: "12px",
                  backgroundColor: "#A8D5BA40",
                  marginBottom: "8px"
                }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    backgroundColor: "#4B2E83",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontWeight: "900"
                  }}>
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ 
                      fontSize: "14px", 
                      fontWeight: "700", 
                      color: "#4B2E83",
                      margin: 0
                    }}>
                      {userName}
                    </p>
                    <p style={{ 
                      fontSize: "12px", 
                      color: "#6B7280",
                      margin: 0
                    }}>
                      {isAdmin ? "مدير عام" : "عميل"}
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
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "700",
                    textDecoration: "none",
                    color: "#4B2E83",
                    backgroundColor: "#A8D5BA",
                    marginBottom: "8px"
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
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#DC2626",
                    backgroundColor: "#FEE2E2",
                    border: "none",
                    cursor: "pointer"
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
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "600",
                    textDecoration: "none",
                    color: "#4B2E83",
                    marginBottom: "8px"
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
                    gap: "8px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "700",
                    textDecoration: "none",
                    color: "#FFFFFF",
                    backgroundColor: "#4B2E83"
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