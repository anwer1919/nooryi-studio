"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Music, Menu, X, CalendarCheck, Settings, LogOut, Home, User } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const user = session?.user as any
  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = "" } }, [open])
  if (pathname.startsWith("/admin") || pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password")) return null
  const links = [{ href: "/", label: "الرئيسية", icon: Home }, { href: "/artists", label: "الفنانين", icon: Music }, ...(user ? [{ href: "/my-bookings", label: "حجوزاتي", icon: CalendarCheck }, { href: "/settings", label: "الإعدادات", icon: Settings }] : [])]
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-[#F5A623]/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-3"><div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center shadow-lg shadow-[#F5A623]/20"><Music size={20} className="text-white" /></div><div><p className="text-base md:text-xl font-black text-white">Nooryi</p><p className="text-[9px] text-[#F5A623] font-bold tracking-[0.2em] uppercase">Studio</p></div></Link>
            <nav className="hidden md:flex items-center gap-6">{links.map(l => (<Link key={l.href} href={l.href} className={`text-sm font-semibold transition ${pathname === l.href ? "text-[#F5A623]" : "text-gray-400 hover:text-[#F5A623]"}`}>{l.label}</Link>))}</nav>
            <div className="flex items-center gap-2 md:gap-3">
              {user ? (<><Link href="/settings" className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm font-bold text-gray-300 hover:border-[#F5A623]/30 hover:text-[#F5A623] transition"><User size={14} /> {user.name || "حسابي"}</Link><button onClick={() => signOut({ callbackUrl: "/" })} className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm font-bold text-red-400 hover:border-red-500/30 transition"><LogOut size={14} /> خروج</button></>) : (<><Link href="/login" className="hidden md:flex px-4 py-2 text-sm font-bold text-white border border-[#F5A623]/30 rounded-xl hover:border-[#F5A623] hover:text-[#F5A623] transition">دخول</Link><Link href="/register" className="px-4 py-2 bg-[#F5A623] text-white text-sm font-black rounded-xl hover:bg-[#E8961A] transition">إنشاء حساب</Link></>)}
              <button onClick={() => setOpen(true)} className="md:hidden w-10 h-10 flex items-center justify-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-[#F5A623]"><Menu size={20} /></button>
            </div>
          </div>
        </div>
      </header>
      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)}></div>
          <div className="absolute top-0 right-0 h-full w-72 bg-[#0a0a0a] border-l border-[#F5A623]/15 flex flex-col">
            <div className="p-5 border-b border-[#F5A623]/15 flex items-center justify-between">
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center"><Music size={18} className="text-white" /></div><div><p className="font-black text-white">Nooryi</p><p className="text-[8px] text-[#F5A623] font-bold tracking-[0.2em] uppercase">Studio</p></div></div>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-[#1a1a1a] rounded-lg text-gray-400"><X size={20} /></button>
            </div>
            {user && (
              <div className="p-4 border-b border-[#F5A623]/10">
                <div className="flex items-center gap-3 p-3 bg-[#111] rounded-xl border border-[#F5A623]/10">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center text-white font-black">{(user.name || "م").charAt(0)}</div>
                  <div className="flex-1 min-w-0"><p className="font-bold text-white text-sm truncate">{user.name || "مستخدم"}</p><p className="text-[10px] text-gray-500 truncate">{user.email}</p></div>
                </div>
              </div>
            )}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {links.map(l => (<Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${pathname === l.href ? "bg-[#F5A623] text-[#0a0a0a]" : "text-gray-400 hover:bg-[#111] hover:text-[#F5A623]"}`}><l.icon size={17} /> {l.label}</Link>))}
            </nav>
            <div className="p-3 border-t border-[#F5A623]/10 space-y-1">
              {user ? (<button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 font-bold text-sm transition"><LogOut size={17} /> تسجيل الخروج</button>) : (<><Link href="/login" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-[#111] font-bold text-sm transition">تسجيل الدخول</Link><Link href="/register" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#F5A623] text-white font-black text-sm transition">إنشاء حساب</Link></>)}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
