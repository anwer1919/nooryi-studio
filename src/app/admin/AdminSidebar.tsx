"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { 
  LayoutDashboard, 
  Calendar, 
  Music, 
  UserCog, 
  Menu, 
  X, 
  LogOut, 
  Home, 
  BarChart3 
} from "lucide-react"
import { useState, useEffect } from "react"

export default function AdminSidebar({ userRole, userName, userEmail }: any) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  
  // ✅ الحارس الأساسي لمنع خطأ Hydration #441
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  const isManager = userRole === "ARTIST_MANAGER"

  const links = isAdmin 
    ? [
        { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
        { href: "/admin/bookings", label: "الحجوزات", icon: Calendar },
        { href: "/admin/artists", label: "الفنانين", icon: Music },
        { href: "/admin/artists-managers", label: "مديرو الأعمال", icon: UserCog },
        { href: "/admin/stats", label: "التقارير المالية", icon: BarChart3 },
      ]
    : [
        { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
        { href: "/admin/bookings", label: "حجوزاتي", icon: Calendar },
      ]

  // ✅ العودة بـ null أثناء التحميل يمنع أي تعارض بين الخادم والمتصفح
  if (!isMounted) {
    return null
  }

  return (
    <>
      {/* ==========================================
          Mobile Header (يظهر فقط على الجوال)
      ========================================== */}
      <div className="lg:hidden" style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        backgroundColor: "var(--color-background)",
        borderBottom: "1px solid var(--color-border)",
        padding: "var(--space-4)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Music size={18} style={{ color: "var(--color-primary)" }} />
            </div>
            <span style={{
              fontSize: "var(--text-lg)",
              fontWeight: "900",
              color: "var(--color-text-primary)"
            }}>
              Nooryi
            </span>
          </div>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-background-subtle)",
              border: "1px solid var(--color-border)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-primary)"
            }}
            aria-label="فتح القائمة"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ==========================================
          Mobile Overlay (خلفية معتمة عند فتح القائمة)
      ========================================== */}
      {isOpen && (
        <div 
          className="lg:hidden"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 10, 26, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 45
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ==========================================
          Mobile Sidebar (قائمة تنزلق من اليمين)
      ========================================== */}
      <aside 
        className="lg:hidden"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "280px",
          backgroundColor: "var(--color-background)",
          borderLeft: "1px solid var(--color-border)",
          zIndex: 50,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflowY: "auto",
          boxShadow: "var(--shadow-xl)"
        }}
      >
        <SidebarContent 
          links={links}
          pathname={pathname}
          userName={userName}
          userEmail={userEmail}
          isAdmin={isAdmin}
          onClose={() => setIsOpen(false)}
        />
      </aside>

      {/* ==========================================
          Desktop Sidebar (شريط جانبي ثابت)
      ========================================== */}
      <aside 
        className="hidden lg:block"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "288px",
          backgroundColor: "var(--color-background)",
          borderLeft: "1px solid var(--color-border)",
          overflowY: "auto",
          boxShadow: "var(--shadow-sm)"
        }}
      >
        <SidebarContent 
          links={links}
          pathname={pathname}
          userName={userName}
          userEmail={userEmail}
          isAdmin={isAdmin}
        />
      </aside>
    </>
  )
}

// ==========================================
// مكون فرعي مشترك للمحتوى (يمنع تكرار الكود)
// ==========================================
function SidebarContent({ links, pathname, userName, userEmail, isAdmin, onClose }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      
      {/* 1. Logo Area */}
      <div style={{
        padding: "var(--space-6)",
        borderBottom: "1px solid var(--color-border-light)"
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", textDecoration: "none" }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "var(--radius-lg)",
            backgroundColor: "var(--color-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--shadow-sm)"
          }}>
            <Music size={20} style={{ color: "var(--color-primary)" }} />
          </div>
          <div>
            <p style={{ fontSize: "var(--text-lg)", fontWeight: "900", color: "var(--color-text-primary)" }}>
              Nooryi
            </p>
            <p style={{
              fontSize: "10px",
              color: "var(--color-text-tertiary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: "600"
            }}>
              {isAdmin ? "Admin Panel" : "Manager Panel"}
            </p>
          </div>
        </Link>
      </div>

      {/* 2. User Info Card */}
      <div style={{ padding: "var(--space-4)", borderBottom: "1px solid var(--color-border-light)" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          padding: "var(--space-3)",
          borderRadius: "var(--radius-lg)",
          backgroundColor: "var(--color-background-subtle)",
          border: "1px solid var(--color-border-light)"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "var(--radius-full)",
            background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            fontSize: "var(--text-sm)",
            fontWeight: "700",
            flexShrink: 0
          }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: "var(--text-sm)",
              fontWeight: "600",
              color: "var(--color-text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}>
              {userName}
            </p>
            <p style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-text-tertiary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}>
              {userEmail}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Navigation Links */}
      <nav style={{ flex: 1, padding: "var(--space-4)", overflowY: "auto" }}>
        <p style={{
          fontSize: "var(--text-xs)",
          fontWeight: "600",
          color: "var(--color-text-tertiary)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          padding: "0 var(--space-3)",
          marginBottom: "var(--space-2)"
        }}>
          القائمة الرئيسية
        </p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          {links.map((link: any) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))
            
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose} // إغلاق القائمة عند النقر (للجوال)
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  padding: "var(--space-3) var(--space-4)",
                  borderRadius: "var(--radius-lg)",
                  fontSize: "var(--text-sm)",
                  fontWeight: "500",
                  textDecoration: "none",
                  color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
                  backgroundColor: isActive ? "var(--color-primary-50)" : "transparent",
                  border: isActive ? "1px solid var(--color-primary-100)" : "1px solid transparent",
                  transition: "all var(--transition-fast)"
                }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* 4. Footer Actions */}
      <div style={{
        padding: "var(--space-4)",
        borderTop: "1px solid var(--color-border-light)",
        backgroundColor: "var(--color-background-subtle)"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <Link 
            href="/"
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-3) var(--space-4)",
              borderRadius: "var(--radius-lg)",
              fontSize: "var(--text-sm)",
              fontWeight: "500",
              textDecoration: "none",
              color: "var(--color-text-secondary)",
              transition: "all var(--transition-fast)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--color-background)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <Home size={18} />
            <span>العودة للموقع</span>
          </Link>
          
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-3) var(--space-4)",
              borderRadius: "var(--radius-lg)",
              fontSize: "var(--text-sm)",
              fontWeight: "600",
              color: "var(--color-danger)",
              backgroundColor: "transparent",
              border: "1px solid transparent",
              cursor: "pointer",
              width: "100%",
              textAlign: "right",
              transition: "all var(--transition-fast)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#FEE2E2"
              e.currentTarget.style.borderColor = "#FECACA"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent"
              e.currentTarget.style.borderColor = "transparent"
            }}
          >
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </div>
  )
}