"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { LayoutDashboard, Calendar, Music, TrendingUp, UserCog, Menu, X, LogOut, Home } from "lucide-react"
import { useState, useEffect } from "react"

export default function AdminSidebar({ userRole, userName, userEmail }: any) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  
  // ✅ هذا هو الحل الجذري لخطأ Hydration #441
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN"
  const links = isAdmin 
    ? [
        { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
        { href: "/admin/bookings", label: "الحجوزات", icon: Calendar },
        { href: "/admin/artists", label: "الفنانين", icon: Music },
        { href: "/admin/artists-managers", label: "مديرو الأعمال", icon: UserCog },
        { href: "/admin/stats", label: "التقارير المالية", icon: TrendingUp },
      ]
    : [
        { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
        { href: "/admin/bookings", label: "حجوزاتي", icon: Calendar },
      ]

  // ✅ عرض هيكل فارغ أثناء التحميل لمنع التعارض بين السيرفر والمتصفح
  if (!isMounted) {
    return <div className="hidden lg:block fixed top-0 right-0 h-full w-72 bg-primary dark:bg-dark-surface border-l border-white/10 z-30" />
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-8 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-accent blur-xl opacity-50 group-hover:opacity-75 transition-all duration-300" />
            <div className="relative bg-accent w-10 h-10 rounded-xl flex items-center justify-center text-primary font-black text-xl shadow-glow">
              N
            </div>
          </div>
          <div>
            <p className="text-xl font-black text-white">Nooryi</p>
            <p className="text-[10px] text-accent uppercase tracking-widest">
              {isAdmin ? "Admin Panel" : "Manager Panel"}
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))
          
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                isActive
                  ? "bg-accent/20 text-accent border border-accent/30 shadow-glow"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span className="text-sm">{link.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300">
          <Home size={18} />
          <span className="text-sm">العودة للموقع</span>
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-300">
          <LogOut size={18} />
          <span className="text-sm">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="lg:hidden fixed top-4 right-4 z-50 p-3 bg-primary text-white rounded-xl shadow-soft hover:bg-primary-dark transition-all">
        <Menu size={20} />
      </button>

      {isOpen && <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />}

      <aside className={`lg:hidden fixed top-0 right-0 h-full w-72 bg-primary dark:bg-dark-surface border-l border-white/10 z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <button onClick={() => setIsOpen(false)} className="absolute top-4 left-4 p-2 text-white/60 hover:text-white transition-all">
          <X size={20} />
        </button>
        <SidebarContent />
      </aside>

      <aside className="hidden lg:block fixed top-0 right-0 h-full w-72 bg-primary dark:bg-dark-surface border-l border-white/10 z-30">
        <SidebarContent />
      </aside>
    </>
  )
}