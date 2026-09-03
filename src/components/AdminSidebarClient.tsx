"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import {
  LayoutDashboard, Users, Music, Calendar, FileText,
  Settings, LogOut, X, Banknote, Shield,
} from "lucide-react"

const iconMap: Record<string, any> = {
  LayoutDashboard, Users, Music, Calendar, FileText, Settings, Banknote, Shield,
}

interface MenuItem { href: string; label: string; icon: string }

export default function AdminSidebarClient({
  menuItems, userName, userRole,
}: {
  menuItems: MenuItem[]; userName: string; userRole: string;
}) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev)
    window.addEventListener("toggle-admin-menu", handleToggle)
    return () => window.removeEventListener("toggle-admin-menu", handleToggle)
  }, [])

  useEffect(() => { setIsOpen(false) }, [pathname])

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside
        className={`
          fixed top-0 right-0 h-full w-72 bg-white border-l border-[#e8e4d9] z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* الشعار */}
          <div className="p-6 border-b border-[#e8e4d9]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#111] to-[#232323] flex items-center justify-center shadow-lg">
                  <span className="text-[#d4af37] text-xl font-black">N</span>
                </div>
                <div>
                  <h1 className="text-lg font-black text-gray-900">Nooryi</h1>
                  <p className="text-[9px] text-[#b8941f] font-bold tracking-[0.25em] uppercase">Admin</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 hover:bg-[#faf8f0] rounded-xl transition">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* بطاقة المستخدم */}
          <div className="p-4 bg-[#faf8f0] border-b border-[#e8e4d9]">
            <div className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm border border-[#e8e4d9]">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#b8941f] flex items-center justify-center text-[#111] font-black text-lg shadow-md">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{userName}</p>
                <p className="text-xs text-[#b8941f] font-bold">
                  {userRole === "SUPER_ADMIN" ? "مدير عام" : userRole === "ADMIN" ? "إدارة" : "مدير أعمال"}
                </p>
              </div>
            </div>
          </div>

          {/* التنقل */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
              const IconComponent = iconMap[item.icon] || LayoutDashboard
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    group flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all
                    ${isActive
                      ? "bg-gradient-to-l from-[#111] to-[#232323] text-[#d4af37] shadow-lg"
                      : "text-gray-600 hover:bg-[#faf8f0] hover:text-[#b8941f]"}
                  `}
                >
                  <IconComponent size={20} className={isActive ? "text-[#d4af37]" : "text-gray-400 group-hover:text-[#b8941f]"} />
                  <span>{item.label}</span>
                  {isActive && <div className="mr-auto w-2 h-2 rounded-full bg-[#d4af37]"></div>}
                </Link>
              )
            })}
          </nav>

          {/* الخروج */}
          <div className="p-4 border-t border-[#e8e4d9]">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 font-bold transition"
            >
              <LogOut size={20} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}