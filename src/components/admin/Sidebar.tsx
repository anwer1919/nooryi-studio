"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { LayoutDashboard, Calendar, Music, UserCog, Menu, X, LogOut, Home, BarChart3, DollarSign, Bug } from "lucide-react"
import { useState, useEffect } from "react"

export default function AdminSidebar({ userRole, userName, userEmail }: any) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
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
        { href: "/admin/stats", label: "التقارير", icon: BarChart3 },
        { href: "/admin/calendar", label: "التقويم", icon: Calendar },
        { href: "/admin/pricing", label: "التسعير", icon: DollarSign },
        { href: "/admin/debug", label: "الاختبار", icon: Bug },
      ]
    : [
        { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
        { href: "/admin/bookings", label: "حجوزاتي", icon: Calendar },
      ]

  if (!isMounted) {
    return null
  }

  return (
    <>
      {/* زر القائمة للجوال */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-[#1a1a1a] border border-[#F5A623]/30 rounded-xl text-white hover:bg-[#F5A623] hover:text-[#111] transition-all"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* الخلفية المعتمة */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* الشريط الجانبي */}
      <aside className={`fixed top-0 right-0 h-full w-72 bg-[#0a0a0a] border-l border-white/10 z-50 transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center shadow-lg shadow-[#F5A623]/30">
              <span className="text-xl font-black text-[#111]">
                {(userName || "A").charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white truncate">{userName || "مستخدم"}</p>
              <p className="text-xs text-white/60 truncate">{userEmail}</p>
              <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/30">
                {userRole === "SUPER_ADMIN" ? "مدير عام" : userRole === "ADMIN" ? "إدارة" : "مدير فنان"}
              </span>
            </div>
          </div>
        </div>

        {/* روابط */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-[#F5A623]/20 to-[#E8961A]/10 border border-[#F5A623]/30 text-[#F5A623]"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <link.icon size={20} className={isActive ? "text-[#F5A623]" : ""} />
                <span className="font-semibold">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* زر تسجيل الخروج */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-[#0a0a0a]">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold transition-colors"
          >
            <LogOut size={18} />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  )
}