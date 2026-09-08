"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { LayoutDashboard, Users, Music, Calendar, FileText, Settings, LogOut, X, Banknote, Shield } from "lucide-react"

const iconMap: Record<string, any> = { LayoutDashboard, Users, Music, Calendar, FileText, Settings, Banknote, Shield }
interface MenuItem { href: string; label: string; icon: string }

export default function AdminSidebarClient({ menuItems, userName, userRole }: { menuItems: MenuItem[]; userName: string; userRole: string }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const t = () => setIsOpen(p => !p)
    window.addEventListener("toggle-admin-menu", t)
    return () => window.removeEventListener("toggle-admin-menu", t)
  }, [])
  useEffect(() => { setIsOpen(false) }, [pathname])
  useEffect(() => { document.body.style.overflow = isOpen ? "hidden" : ""; return () => { document.body.style.overflow = "" } }, [isOpen])

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)} />}
      <aside className={`fixed top-0 right-0 h-full w-72 bg-[#0a0a0a] border-l border-[#D4AF37]/20 z-50 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-[#D4AF37]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
                  <span className="text-[#0a0a0a] text-xl font-black">N</span>
                </div>
                <div><h1 className="text-lg font-black text-white">Nooryi</h1><p className="text-[9px] text-[#D4AF37] font-bold tracking-[0.25em] uppercase">Admin</p></div>
              </div>
              <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 hover:bg-[#1a1a1a] rounded-xl transition"><X size={20} className="text-gray-400" /></button>
            </div>
          </div>
          <div className="p-4 border-b border-[#D4AF37]/10">
            <div className="flex items-center gap-3 p-3 bg-[#111] rounded-2xl border border-[#D4AF37]/10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center text-[#0a0a0a] font-black text-lg shadow-md">{userName.charAt(0).toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm truncate">{userName}</p>
                <p className="text-xs text-[#D4AF37] font-bold">{userRole === "SUPER_ADMIN" ? "مدير عام" : userRole === "ADMIN" ? "إدارة" : "مدير أعمال"}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
              const Icon = iconMap[item.icon] || LayoutDashboard
              return (
                <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm ${isActive ? "bg-gradient-to-l from-[#D4AF37] to-[#b8941f] text-[#0a0a0a] shadow-lg shadow-[#D4AF37]/20" : "text-gray-400 hover:bg-[#111] hover:text-[#D4AF37]"}`}>
                  <Icon size={18} className={isActive ? "text-[#0a0a0a]" : "text-gray-500 group-hover:text-[#D4AF37]"} />
                  <span>{item.label}</span>
                  {isActive && <div className="mr-auto w-1.5 h-1.5 rounded-full bg-[#0a0a0a]" />}
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t border-[#D4AF37]/10">
            <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 font-bold transition text-sm">
              <LogOut size={18} /><span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}