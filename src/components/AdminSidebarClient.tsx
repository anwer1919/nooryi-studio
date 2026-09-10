"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import ThemeToggle from "@/components/ThemeToggle"
import { useState, useEffect } from "react"
import { LayoutDashboard, Users, Music, Calendar, FileText, Settings, LogOut, X, Banknote, Shield, Bell } from "lucide-react"
const iconMap: Record<string, any> = { LayoutDashboard, Users, Music, Calendar, FileText, Settings, Banknote, Shield, Bell }
interface MenuItem { href: string; label: string; icon: string }
export default function AdminSidebarClient({ menuItems, userName, userRole }: { menuItems: MenuItem[]; userName: string; userRole: string }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => { const t = () => setIsOpen(p => !p); window.addEventListener("toggle-admin-menu", t); return () => window.removeEventListener("toggle-admin-menu", t) }, [])
  useEffect(() => { setIsOpen(false) }, [pathname])
  useEffect(() => { document.body.style.overflow = isOpen ? "hidden" : ""; return () => { document.body.style.overflow = "" } }, [isOpen])
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/90 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}
      <aside className={`fixed top-0 right-0 h-full w-72 bg-bg border-l border-[#F5A623]/15 z-50 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-[#F5A623]/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center shadow-lg shadow-[#F5A623]/20"><span className="text-[#0a0a0a] text-lg font-black">N</span></div>
                <div><h1 className="text-base font-black text-fg">Nooryi</h1><p className="text-[8px] text-[#F5A623] font-bold tracking-[0.2em] uppercase">Admin</p></div>
              </div>
              <button onClick={() => setIsOpen(false)} className="lg:hidden p-1.5 hover:bg-card rounded-lg transition"><X size={18} className="text-muted"/></button>
            </div>
          </div>
          <div className="p-3 border-b border-[#F5A623]/10">
            <div className="flex items-center gap-3 p-2.5 bg-surface rounded-xl border border-[#F5A623]/10">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center text-[#0a0a0a] font-black text-base">{userName.charAt(0).toUpperCase()}</div>
              <div className="flex-1 min-w-0"><p className="font-bold text-fg text-sm truncate">{userName}</p><p className="text-[10px] text-[#F5A623] font-bold">{userRole === "SUPER_ADMIN" ? "مدير عام" : userRole === "ADMIN" ? "إدارة" : "مدير أعمال"}</p></div>
            </div>
          </div>
          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
              const Icon = iconMap[item.icon] || LayoutDashboard
              return (<Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold transition-all text-sm ${isActive ? "bg-gradient-to-l from-[#F5A623] to-[#E8961A] text-[#0a0a0a] shadow-lg shadow-[#F5A623]/20" : "text-muted hover:bg-surface hover:text-[#F5A623]"}`}><Icon size={16} className={isActive ? "text-[#0a0a0a]" : "text-muted group-hover:text-[#F5A623]"}/><span>{item.label}</span>{isActive && <div className="mr-auto w-1.5 h-1.5 rounded-full bg-bg"/>}</Link>)
            })}
          </nav>
          <div className="p-2 border-t border-[#F5A623]/10">
            <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 font-bold transition text-sm"><LogOut size={16}/><span>تسجيل الخروج</span></button>
          </div>
        </div>
      </aside>
    </>
  )
}