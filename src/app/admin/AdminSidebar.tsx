"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { LayoutDashboard, Calendar, Music, UserCog, Menu, X, LogOut, BarChart3, Home } from "lucide-react"
import { useState, useEffect } from "react"

export default function AdminSidebar({ userRole, userName, userEmail }: { userRole: string, userName: string, userEmail: string }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  
  const links = isAdmin ? [
    { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/admin/bookings", label: "الحجوزات", icon: Calendar },
    { href: "/admin/artists", label: "الفنانين", icon: Music },
    { href: "/admin/artists-managers", label: "مديرو الأعمال", icon: UserCog },
    { href: "/admin/stats", label: "التقارير المالية", icon: BarChart3 },
  ] : [
    { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/admin/bookings", label: "حجوزاتي", icon: Calendar },
  ]

  const initial = (userName || "U").trim().charAt(0).toUpperCase()

  return (
    <>
      {/* MOBILE TOP BAR */}
      {isMobile && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, height: "64px",
          backgroundColor: "white", borderBottom: "1px solid #E5E7EB",
          zIndex: 40, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "32px", height: "32px", backgroundColor: "#9333EA", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Music size={18} style={{ color: "white" }} />
            </div>
            <span style={{ fontSize: "18px", fontWeight: "bold", color: "#111827" }}>Nooryi</span>
          </div>
          <button onClick={() => setIsOpen(!isOpen)} style={{
            padding: "8px", borderRadius: "8px", backgroundColor: "transparent",
            border: "none", cursor: "pointer", color: "#6B7280"
          }}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      )}

      {/* MOBILE OVERLAY */}
      {isMobile && isOpen && (
        <div onClick={() => setIsOpen(false)} style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)", zIndex: 40
        }} />
      )}

      {/* SIDEBAR */}
      <aside style={{
        position: "fixed", top: 0, right: 0, height: "100vh", width: "288px",
        backgroundColor: "white", borderLeft: "1px solid #E5E7EB", zIndex: 50,
        transform: isMobile ? (isOpen ? "translateX(0)" : "translateX(100%)") : "translateX(0)",
        transition: "transform 0.3s ease-in-out",
        boxShadow: isMobile ? "0 20px 25px -5px rgba(0,0,0,0.1)" : "none"
      }}>
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          
          {/* LOGO (Desktop) */}
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "24px", borderBottom: "1px solid #F3F4F6" }}>
              <div style={{ width: "40px", height: "40px", backgroundColor: "#9333EA", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 15px -3px rgba(147, 51, 234, 0.2)" }}>
                <Music size={20} style={{ color: "white" }} />
              </div>
              <div>
                <p style={{ fontSize: "20px", fontWeight: "bold", color: "#111827", margin: 0 }}>Nooryi</p>
                <p style={{ fontSize: "10px", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600", margin: 0 }}>
                  {isAdmin ? "Admin Panel" : "Manager Panel"}
                </p>
              </div>
            </div>
          )}

          {/* USER CARD */}
          <div style={{ padding: "16px", borderBottom: "1px solid #F3F4F6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", backgroundColor: "#FAF5FF", borderRadius: "12px", border: "1px solid #E9D5FF" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "9999px",
                background: "linear-gradient(135deg, #9333EA 0%, #7E22CE 100%)",
                color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: "bold", fontSize: "18px", flexShrink: 0, boxShadow: "0 4px 6px -1px rgba(147, 51, 234, 0.3)"
              }}>
                {initial}
              </div>
              <div style={{ overflow: "hidden" }}>
                <p style={{ fontSize: "14px", fontWeight: "bold", color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</p>
                <p style={{ fontSize: "12px", color: "#6B7280", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userEmail}</p>
              </div>
            </div>
          </div>

          {/* NAVIGATION */}
          <nav style={{ flex: 1, padding: "16px", overflowY: "auto" }}>
            <p style={{ fontSize: "10px", fontWeight: "bold", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", padding: "0 12px", marginBottom: "8px", marginTop: "8px" }}>
              القائمة الرئيسية
            </p>
            {links.map((link, idx) => {
              const Icon = link.icon
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link key={idx} href={link.href} onClick={() => setIsOpen(false)} style={{
                  display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px",
                  borderRadius: "12px", fontSize: "14px", fontWeight: isActive ? "600" : "500",
                  textDecoration: "none", marginBottom: "4px",
                  backgroundColor: isActive ? "#9333EA" : "transparent",
                  color: isActive ? "white" : "#6B7280",
                  boxShadow: isActive ? "0 4px 6px -1px rgba(147, 51, 234, 0.3)" : "none",
                  transition: "all 0.2s"
                }}>
                  <Icon size={20} style={{ flexShrink: 0, color: isActive ? "white" : "#9CA3AF" }} />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* FOOTER */}
          <div style={{ padding: "16px", borderTop: "1px solid #F3F4F6" }}>
            <Link href="/" onClick={() => setIsOpen(false)} style={{
              display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px",
              borderRadius: "12px", fontSize: "14px", fontWeight: "500", textDecoration: "none",
              color: "#6B7280", marginBottom: "8px"
            }}>
              <Home size={20} />
              <span>العودة للموقع</span>
            </Link>
            <button onClick={() => signOut({ callbackUrl: "/" })} style={{
              width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px",
              borderRadius: "12px", fontSize: "14px", fontWeight: "600",
              color: "#DC2626", backgroundColor: "transparent", border: "none", cursor: "pointer"
            }}>
              <LogOut size={20} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}