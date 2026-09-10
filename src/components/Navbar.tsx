"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Music, Menu, X, CalendarCheck, Settings, LogOut, Home, User, LayoutDashboard } from "lucide-react"
import ThemeToggle from "@/components/ThemeToggle"

export default function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = "" } }, [open])
  if (pathname.startsWith("/admin") || pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password")) return null
  const user = (session?.user ?? null) as any
  const isAuthenticated = !!user
  const displayName = user?.name || (user?.email ? String(user.email).split("@")[0] : "") || "حسابي"
  const isAdminRole = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN" || user?.role === "ARTIST_MANAGER"
  const links = [{ href: "/", label: "الرئيسية", icon: Home }, { href: "/artists", label: "الفنانين", icon: Music }, ...(isAuthenticated ? [{ href: "/my-bookings", label: "حجوزاتي", icon: CalendarCheck }, { href: "/settings", label: "الإعدادات", icon: Settings }, ...(isAdminRole ? [{ href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard }] : [])] : [])]
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-xl border-b border-[#F5A623]/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-3"><div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center shadow-lg shadow-[#F5A623]/20"><Music size={20} className="text-white" /></div><div><p className="text-base md:text-xl font-black text-fg">Nooryi</p><p className="text-[9px] text-[#F5A623] font-bold tracking-[0.2em] uppercase">Studio</p></div></Link>
            <nav className="hidden md:flex items-center gap-6">{links.map(l => (<Link key={l.href} href={l.href} className={`text-sm font-semibold transition ${pathname === l.href ? "text-[#F5A623]" : "text-muted hover:text-[#F5A623]"}`}>{l.label}</Link>))}</nav>
            <div className="flex items-center gap-2 md:gap-3"><ThemeToggle />
              {status === "loading" ? (
                <div className="flex items-center gap-2"><div className="w-16 h-9 bg-surface rounded-xl animate-pulse"></div><div className="hidden md:block w-16 h-9 bg-surface rounded-xl animate-pulse"></div></div>
              ) : isAuthenticated ? (
                <>
                  <Link href="/settings" className="flex items-center gap-2 px-3 py-2 bg-card border border-line rounded-xl text-sm font-bold text-fg hover:border-[#F5A623]/40 hover:text-[#F5A623] transition">
                    <span className="w-6 h-6 rounded-md bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center text-white text-xs font-black">{displayName.charAt(0).toUpperCase()}</span>
                    <span className="max-w-[70px] md:max-w-[140px] truncate">{displayName}</span>
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="hidden md:flex items-center gap-2 px-4 py-2 bg-card border border-line rounded-xl text-sm font-bold text-red-400 hover:border-red-500/40 transition"><LogOut size={14} /> خروج</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="hidden md:flex px-4 py-2 text-sm font-bold text-fg border border-[#F5A623]/30 rounded-xl hover:border-[#F5A623] hover:text-[#F5A623] transition">دخول</Link>
                  <Link href="/register" className="px-4 py-2 bg-[#F5A623] text-[#0a0a0a] text-sm font-black rounded-xl hover:bg-[#E8961A] transition">إنشاء حساب</Link>
                </>
              )}
              <button onClick={() => setOpen(true)} className="md:hidden w-10 h-10 flex items-center justify-center bg-card border border-line rounded-xl text-[#F5A623]"><Menu size={20} /></button>
            </div>
          </div>
        </div>
      </header>
      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)}></div>
          <div className="absolute top-0 right-0 h-full w-72 bg-bg border-l border-[#F5A623]/15 flex flex-col">
            <div className="p-5 border-b border-[#F5A623]/15 flex items-center justify-between">
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center"><Music size={18} className="text-white" /></div><div><p className="font-black text-fg">Nooryi</p><p className="text-[8px] text-[#F5A623] font-bold tracking-[0.2em] uppercase">Studio</p></div></div>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-surface rounded-lg text-muted"><X size={20} /></button>
            </div>
            {status === "loading" ? (
              <div className="p-4 border-b border-[#F5A623]/10"><div className="h-16 bg-surface rounded-xl animate-pulse"></div></div>
            ) : isAuthenticated ? (
              <div className="p-4 border-b border-[#F5A623]/10">
                <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-line">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center text-white font-black">{displayName.charAt(0).toUpperCase()}</div>
                  <div className="flex-1 min-w-0"><p className="font-bold text-fg text-sm truncate">{displayName}</p><p className="text-[10px] text-muted truncate">{user?.email}</p></div>
                </div>
              </div>
            ) : null}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {links.map(l => (<Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${pathname === l.href ? "bg-[#F5A623] text-[#0a0a0a]" : "text-muted hover:bg-surface hover:text-[#F5A623]"}`}><l.icon size={17} /> {l.label}</Link>))}
            </nav>
            <div className="p-3 border-t border-[#F5A623]/10 space-y-1"><div className="px-1 pb-2"><div className="flex items-center justify-between px-4 py-2.5 bg-surface border border-line rounded-xl"><span className="text-sm font-bold text-fg">الوضع الليلي</span><ThemeToggle /></div></div>
              {status === "loading" ? null : isAuthenticated ? (
                <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 font-bold text-sm transition"><LogOut size={17} /> تسجيل الخروج</button>
              ) : (
                <><Link href="/login" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-fg hover:bg-surface font-bold text-sm transition">تسجيل الدخول</Link><Link href="/register" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#F5A623] text-[#0a0a0a] font-black text-sm transition">إنشاء حساب</Link></>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
