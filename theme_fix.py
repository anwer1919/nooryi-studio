# -*- coding: utf-8 -*-
import os, re

# ═══ 1) حماية النصوص البيضاء فوق الصور من الاستبدال ═══
SENT = [
    ("text-white drop-shadow-lg", "\x01W1\x01"),
    ("text-white leading-tight drop-shadow-lg", "\x01W2\x01"),
    ("font-black text-white mb-4", "\x01W3\x01"),
    ("text-white font-black text-sm truncate", "\x01W4\x01"),
    ("text-white/70 text-lg", "\x01W5\x01"),
    ("text-sm text-white mt-1", "\x01W6\x01"),
    ("text-2xl font-black text-white", "\x01W7\x01"),
]

# ═══ 2) الاستبدالات: من ألوان ثابتة إلى متغيرات تنقلب مع الوضع ═══
REPL = [
    ("bg-[#0a0a0a]/95", "bg-bg/95"),
    ("bg-[#0a0a0a]", "bg-bg"),
    ("from-[#0a0a0a]", "from-bg"),
    ("via-[#111]", "via-surface"),
    ("to-[#0a0a0a]", "to-bg"),
    ("bg-[#111]", "bg-surface"),
    ("from-[#111]", "from-surface"),
    ("bg-[#161616]", "bg-card"),
    ("bg-[#1a1a1a]", "bg-card"),
    ("hover:bg-[#1a1a1a]", "hover:bg-surface"),
    ("hover:bg-[#111]", "hover:bg-surface"),
    ("hover:bg-[#222]", "hover:bg-surface"),
    ("to-[#1a1a1a]", "to-card"),
    ("border-[#2a2a2a]", "border-line"),
    ("divide-[#2a2a2a]", "divide-line"),
    ("border-white/10", "border-line"),
    ("text-white/60", "text-muted"),
    ("text-white/70", "text-muted"),
    ("text-white/80", "text-muted"),
    ("text-gray-400", "text-muted"),
    ("text-gray-500", "text-muted"),
    ("text-gray-600", "text-muted"),
    ("text-gray-300", "text-muted"),
    ("text-white", "text-fg"),
]

ROOT = os.path.join(os.getcwd(), "src")
count = 0
for dirpath, dirs, files in os.walk(ROOT):
    for fn in files:
        if not fn.endswith((".tsx", ".ts")):
            continue
        p = os.path.join(dirpath, fn)
        s = open(p, encoding="utf-8").read()
        o = s
        for a, b in SENT:
            s = s.replace(a, b)
        for a, b in REPL:
            s = s.replace(a, b)
        for a, b in SENT:
            s = s.replace(b, a)
        if s != o:
            open(p, "w", encoding="utf-8").write(s)
            count += 1
            print("themed:", os.path.relpath(p, ROOT))
print("FILES THEMED:", count)

# ═══ 3) globals.css: إضافة المتغيرات التي تنقلب مع الوضع النهاري/الليلي ═══
gp = os.path.join("src", "app", "globals.css")
g = open(gp, encoding="utf-8").read()

TOKENS = '''
/* ═══ Theme variables: light / dark ═══ */
:root {
  --bg: #FFFFFF;
  --surface: #F6F6F7;
  --card: #FFFFFF;
  --line: #E6E6E9;
  --fg: #111113;
  --muted: #63636B;
}
.dark {
  --bg: #0a0a0a;
  --surface: #111111;
  --card: #161616;
  --line: #2a2a2a;
  --fg: #FFFFFF;
  --muted: #9a9aa2;
}
@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-card: var(--card);
  --color-line: var(--line);
  --color-fg: var(--fg);
  --color-muted: var(--muted);
}
'''

if "@theme inline" not in g:
    g = g.replace('@custom-variant dark (&:where(.dark, .dark *));',
                  '@custom-variant dark (&:where(.dark, .dark *));' + TOKENS, 1)

# جسم الصفحة يتبع الوضع
g = g.replace("background: #0a0a0a;\n  color: #e5e5e5;", "background: var(--bg);\n  color: var(--fg);")
g = g.replace("background: #0a0a0a;", "background: var(--bg);")
# المكونات تتبع الوضع
g = g.replace(".card-pro { background: #111;", ".card-pro { background: var(--card);")
g = g.replace(".stat-card { background: #111;", ".stat-card { background: var(--card);")
g = g.replace(".stat-value { font-size: 1.8rem; font-weight: 900; color: #fff;", ".stat-value { font-size: 1.8rem; font-weight: 900; color: var(--fg);")
g = g.replace(".table-pro { width: 100%; border-collapse: separate; border-spacing: 0; background: #111;", ".table-pro { width: 100%; border-collapse: separate; border-spacing: 0; background: var(--card);")
g = g.replace(".table-pro thead th { background: #0a0a0a;", ".table-pro thead th { background: var(--surface);")
g = g.replace(".table-pro tbody tr:hover { background: #1a1a1a; }", ".table-pro tbody tr:hover { background: var(--surface); }")
g = g.replace(".input-modern { width: 100%; padding: .8rem 1rem; border-radius: 12px; border: 2px solid rgba(245,166,35,.15); background: #1a1a1a; font: inherit; color: #e5e5e5; }",
              ".input-modern { width: 100%; padding: .8rem 1rem; border-radius: 12px; border: 2px solid var(--line); background: var(--card); font: inherit; color: var(--fg); }")
g = g.replace(".icon-circle.dark { background: #1a1a1a;", ".icon-circle.dark { background: var(--card);")
g = g.replace("::-webkit-scrollbar-track{background:#111}", "::-webkit-scrollbar-track{background:var(--surface)}")
open(gp, "w", encoding="utf-8").write(g)
print("globals.css themed")

# ═══ 4) Navbar: اسم المستخدم ظاهر في الهيدر حتى على الجوال ═══
NAVBAR = '''"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Music, Menu, X, CalendarCheck, Settings, LogOut, Home, User } from "lucide-react"

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
  const links = [{ href: "/", label: "الرئيسية", icon: Home }, { href: "/artists", label: "الفنانين", icon: Music }, ...(isAuthenticated ? [{ href: "/my-bookings", label: "حجوزاتي", icon: CalendarCheck }, { href: "/settings", label: "الإعدادات", icon: Settings }] : [])]
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-xl border-b border-[#F5A623]/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-3"><div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center shadow-lg shadow-[#F5A623]/20"><Music size={20} className="text-white" /></div><div><p className="text-base md:text-xl font-black text-fg">Nooryi</p><p className="text-[9px] text-[#F5A623] font-bold tracking-[0.2em] uppercase">Studio</p></div></Link>
            <nav className="hidden md:flex items-center gap-6">{links.map(l => (<Link key={l.href} href={l.href} className={`text-sm font-semibold transition ${pathname === l.href ? "text-[#F5A623]" : "text-muted hover:text-[#F5A623]"}`}>{l.label}</Link>))}</nav>
            <div className="flex items-center gap-2 md:gap-3">
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
            <div className="p-3 border-t border-[#F5A623]/10 space-y-1">
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
'''
open(os.path.join("src", "components", "Navbar.tsx"), "w", encoding="utf-8").write(NAVBAR)
print("Navbar.tsx updated (mobile name chip)")

# ═══ 5) LoginFormClient: المستخدم العادي → الرئيسية، والأدمن → لوحة التحكم ═══
lp = os.path.join("src", "app", "login", "LoginFormClient.tsx")
s = open(lp, encoding="utf-8").read()

OLD = """      setStep("success")
      router.refresh()
      setTimeout(() => { window.location.href = dest }, 1500)"""
NEW = """      setStep("success")
      router.refresh()
      const sess = await getSession()
      const role = (sess?.user as any)?.role || "USER"
      const home = (role === "SUPER_ADMIN" || role === "ADMIN" || role === "ARTIST_MANAGER") ? "/admin" : "/"
      setTimeout(() => { window.location.href = callbackUrl || home }, 1500)"""

if OLD in s:
    s = s.replace(OLD, NEW)
    # إزالة تعريف dest القديم إن وجد
    s = s.replace('const dest = callbackUrl || "/admin";', '')
    open(lp, "w", encoding="utf-8").write(s)
    print("LoginFormClient redirect fixed")
else:
    print("WARN: redirect pattern not found - check manually")

print("ALL DONE")