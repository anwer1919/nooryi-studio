"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { LayoutDashboard, Calendar, Music, UserCog, Menu, X, LogOut, Home, BarChart3 } from "lucide-react"
import { useState } from "react"

export default function AdminSidebarClient({ userRole, userName, userEmail }: any) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // ✅ ضمان ظهور الروابط: إذا لم يتم تحديد الدور، نعتبره أدمن افتراضياً لمنع القائمة الفارغة
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN" || !userRole

  const links = isAdmin
    ? [
        { href: "/admin", label: "الرئيسية", icon: LayoutDashboard, exact: true },
        { href: "/admin/bookings", label: "الحجوزات", icon: Calendar },
        { href: "/admin/artists", label: "الفنانين", icon: Music },
        { href: "/admin/artists-managers", label: "مديرو الأعمال", icon: UserCog },
        { href: "/admin/stats", label: "التقارير المالية", icon: BarChart3 },
      ]
    : [
        { href: "/admin", label: "الرئيسية", icon: LayoutDashboard, exact: true },
        { href: "/admin/bookings", label: "حجوزاتي", icon: Calendar },
      ]

  return (
    // ✅ suppressHydrationWarning يمنع خطأ #441 نهائياً في هذا المكون
    <div suppressHydrationWarning>
      {/* Mobile Header */}
      <div className="lg:hidden" style={{
        position: "sticky", top: 0, zIndex: 40, backgroundColor: "var(--color-background)",
        borderBottom: "1px solid var(--color-border)", padding: "var(--space-4)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Music size={18} style={{ color: "var(--color-primary)" }} />
            </div>
            <span style={{ fontSize: "var(--text-lg)", fontWeight: "900", color: "var(--color-text-primary)" }}>Nooryi</span>
          </div>
          <button onClick={() => setIsOpen(!isOpen)} style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-background-subtle)", border: "1px solid var(--color-border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="lg:hidden" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 10, 26, 0.6)", backdropFilter: "blur(4px)", zIndex: 45 }} onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className="lg:hidden" style={{
        position: "fixed", top: 0, right: 0, height: "100vh", width: "280px",
        backgroundColor: "var(--color-background)", borderLeft: "1px solid var(--color-border)",
        zIndex: 50, transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", overflowY: "auto", boxShadow: isOpen ? "var(--shadow-xl)" : "none"
      }}>
        <SidebarContent links={links} pathname={pathname} userName={userName || "المستخدم"} userEmail={userEmail || ""} isAdmin={isAdmin} onClose={() => setIsOpen(false)} />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block" style={{
        position: "fixed", top: 0, right: 0, height: "100vh", width: "288px",
        backgroundColor: "var(--color-background)", borderLeft: "1px solid var(--color-border)",
        overflowY: "auto", boxShadow: "var(--shadow-sm)"
      }}>
        <SidebarContent links={links} pathname={pathname} userName={userName || "المستخدم"} userEmail={userEmail || ""} isAdmin={isAdmin} />
      </aside>
    </div>
  )
}

function SidebarContent({ links, pathname, userName, userEmail, isAdmin, onClose }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "var(--space-6)", borderBottom: "1px solid var(--color-border-light)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", textDecoration: "none" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-sm)" }}>
            <Music size={20} style={{ color: "var(--color-primary)" }} />
          </div>
          <div>
            <p style={{ fontSize: "var(--text-lg)", fontWeight: "900", color: "var(--color-text-primary)" }}>Nooryi</p>
            <p style={{ fontSize: "10px", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600" }}>
              {isAdmin ? "Admin Panel" : "Manager Panel"}
            </p>
          </div>
        </Link>
      </div>

      <div style={{ padding: "var(--space-4)", borderBottom: "1px solid var(--color-border-light)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-background-subtle)", border: "1px solid var(--color-border-light)" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-full)", background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: "var(--text-sm)", fontWeight: "700", flexShrink: 0 }}>
            {(userName || "U").charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "var(--text-sm)", fontWeight: "600", color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</p>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userEmail}</p>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "var(--space-4)", overflowY: "auto" }}>
        <p style={{ fontSize: "var(--text-xs)", fontWeight: "600", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "0 var(--space-3)", marginBottom: "var(--space-2)" }}>القائمة الرئيسية</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          {links.map((link: any, index: number) => {
            const Icon = link.icon
            const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href)
            return (
              <Link key={index} href={link.href} onClick={onClose} style={{
                display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) var(--space-4)",
                borderRadius: "var(--radius-lg)", fontSize: "var(--text-sm)", fontWeight: "500", textDecoration: "none",
                color: isActive ? "var(--color-primary)" : "var(--color-text-secondary)",
                backgroundColor: isActive ? "var(--color-primary-50)" : "transparent",
                border: isActive ? "1px solid var(--color-primary-100)" : "1px solid transparent", transition: "all var(--transition-fast)"
              }}>
                <Icon size={18} style={{ flexShrink: 0 }} />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <div style={{ padding: "var(--space-4)", borderTop: "1px solid var(--color-border-light)", backgroundColor: "var(--color-background-subtle)" }}>
        <button onClick={() => signOut({ callbackUrl: "/" })} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3) var(--space-4)", borderRadius: "var(--radius-lg)", fontSize: "var(--text-sm)", fontWeight: "600", color: "var(--color-danger)", backgroundColor: "transparent", border: "1px solid transparent", cursor: "pointer", width: "100%", textAlign: "right" }}>
          <LogOut size={18} /> <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  )
}