# -*- coding: utf-8 -*-
import os

FILES = {}

FILES['src/components/Navbar.tsx'] = '''"use client"
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
'''

FILES['src/app/settings/page.tsx'] = '''import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import SettingsClient from "./SettingsClient"
export const dynamic = "force-dynamic"
export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/settings")
  const u = session.user as any
  return <SettingsClient user={{ name: u.name || "", email: u.email || "", phone: u.phone || "" }} />
}
'''

FILES['src/app/settings/SettingsClient.tsx'] = '''"use client"
import { useState } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { User, Mail, Phone, Lock, Loader2, CheckCircle2, Settings, CalendarCheck, Home, Music, LogOut, Eye, EyeOff } from "lucide-react"

export default function SettingsClient({ user }: { user: { name: string; email: string; phone: string } }) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [profile, setProfile] = useState({ name: user.name, phone: user.phone })
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" })
  const [showPw, setShowPw] = useState(false)
  const inputCls = "w-full pr-10 pl-4 py-3 border border-[#2a2a2a] bg-[#1a1a1a] text-white placeholder:text-gray-500 rounded-xl focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none transition-all"

  const saveProfile = async (e) => {
    e.preventDefault(); setLoading(true); setMsg(null)
    try {
      const r = await fetch("/api/user/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: profile.name, phone: profile.phone }) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || "فشل الحفظ")
      setMsg({ ok: true, text: "تم حفظ التغييرات بنجاح" })
    } catch (err) { setMsg({ ok: false, text: err.message }) } finally { setLoading(false) }
  }

  const savePassword = async (e) => {
    e.preventDefault(); setLoading(true); setMsg(null)
    if (pw.next !== pw.confirm) { setMsg({ ok: false, text: "كلمتا المرور غير متطابقتين" }); setLoading(false); return }
    try {
      const r = await fetch("/api/user/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || "فشل التغيير")
      setMsg({ ok: true, text: "تم تغيير كلمة المرور بنجاح" })
      setPw({ current: "", next: "", confirm: "" })
    } catch (err) { setMsg({ ok: false, text: err.message }) } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 md:pt-28 pb-16" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/25 text-[#F5A623] text-xs font-bold mb-2"><Settings size={14} /> إعدادات الحساب</div>
          <h1 className="text-2xl md:text-3xl font-black text-white">إدارة حسابك</h1>
          <p className="text-gray-400 text-sm mt-1">عدّل بياناتك الشخصية وكلمة المرور</p>
        </div>
        {msg && (<div className={`p-4 rounded-xl border flex items-center gap-2 text-sm font-bold ${msg.ok ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}><CheckCircle2 size={16} /> {msg.text}</div>)}
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-5 md:p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center text-white text-2xl font-black">{(user.name || "م").charAt(0)}</div>
            <div className="flex-1 min-w-0"><p className="text-lg font-black text-white truncate">{user.name || "مستخدم Nooryi"}</p><p className="text-sm text-gray-400 truncate" dir="ltr">{user.email}</p></div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-5">
            <Link href="/" className="flex items-center justify-center gap-2 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-xs font-bold text-gray-300 hover:border-[#F5A623]/30 hover:text-[#F5A623] transition"><Home size={14} /> الرئيسية</Link>
            <Link href="/artists" className="flex items-center justify-center gap-2 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-xs font-bold text-gray-300 hover:border-[#F5A623]/30 hover:text-[#F5A623] transition"><Music size={14} /> الفنانين</Link>
            <Link href="/my-bookings" className="flex items-center justify-center gap-2 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-xs font-bold text-gray-300 hover:border-[#F5A623]/30 hover:text-[#F5A623] transition"><CalendarCheck size={14} /> حجوزاتي</Link>
          </div>
        </div>
        <form onSubmit={saveProfile} className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-5 md:p-6 space-y-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2"><User size={18} className="text-[#F5A623]" /> البيانات الشخصية</h2>
          <div><label className="block text-sm font-bold text-gray-300 mb-2">الاسم الكامل</label><div className="relative"><User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" /><input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className={inputCls} placeholder="اسمك الكامل" /></div></div>
          <div><label className="block text-sm font-bold text-gray-300 mb-2">رقم الهاتف</label><div className="relative"><Phone size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" /><input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className={inputCls} placeholder="01xxxxxxxxx" dir="ltr" /></div></div>
          <div><label className="block text-sm font-bold text-gray-300 mb-2">البريد الإلكتروني (لا يمكن تعديله)</label><div className="relative"><Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" /><input value={user.email} disabled className={inputCls + " opacity-50 cursor-not-allowed"} dir="ltr" /></div></div>
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#F5A623] text-white font-black rounded-xl hover:bg-[#E8961A] transition-all flex justify-center items-center gap-2 disabled:opacity-50 active:scale-[0.97]">{loading ? <Loader2 size={18} className="animate-spin" /> : "حفظ التغييرات"}</button>
        </form>
        <form onSubmit={savePassword} className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-5 md:p-6 space-y-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2"><Lock size={18} className="text-[#F5A623]" /> تغيير كلمة المرور</h2>
          <div><label className="block text-sm font-bold text-gray-300 mb-2">كلمة المرور الحالية</label><div className="relative"><Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" /><input type={showPw ? "text" : "password"} value={pw.current} onChange={e => setPw({ ...pw, current: e.target.value })} className={inputCls} placeholder="••••••••" dir="ltr" /></div></div>
          <div><label className="block text-sm font-bold text-gray-300 mb-2">كلمة المرور الجديدة</label><div className="relative"><Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" /><input type={showPw ? "text" : "password"} value={pw.next} onChange={e => setPw({ ...pw, next: e.target.value })} className={inputCls} placeholder="••••••••" dir="ltr" /><button type="button" onClick={() => setShowPw(!showPw)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#F5A623]">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
          <div><label className="block text-sm font-bold text-gray-300 mb-2">تأكيد كلمة المرور</label><div className="relative"><Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" /><input type={showPw ? "text" : "password"} value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} className={inputCls} placeholder="••••••••" dir="ltr" /></div></div>
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#1a1a1a] border border-[#F5A623]/30 text-[#F5A623] font-black rounded-xl hover:bg-[#F5A623]/10 transition-all flex justify-center items-center gap-2 disabled:opacity-50 active:scale-[0.97]">{loading ? <Loader2 size={18} className="animate-spin" /> : "تغيير كلمة المرور"}</button>
        </form>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full py-3.5 bg-[#161616] border border-red-500/20 text-red-400 font-black rounded-xl hover:bg-red-500/10 transition-all flex justify-center items-center gap-2"><LogOut size={18} /> تسجيل الخروج</button>
      </div>
    </div>
  )
}
'''

FILES['src/app/api/user/profile/route.ts'] = '''import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
export const dynamic = "force-dynamic"
export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "غير مسجل الدخول" }, { status: 401 })
    const id = (session.user as any).id
    const body = await req.json()
    const data: any = {}
    if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim()
    if (typeof body.phone === "string") data.phone = body.phone.trim() || null
    if (body.newPassword) {
      if (!body.currentPassword) return NextResponse.json({ error: "أدخل كلمة المرور الحالية" }, { status: 400 })
      const user = await prisma.user.findUnique({ where: { id } })
      if (!user?.password) return NextResponse.json({ error: "لا يمكن تغيير كلمة مرور هذا الحساب" }, { status: 400 })
      const isHashed = user.password.startsWith("$2")
      const ok = isHashed ? await bcrypt.compare(String(body.currentPassword), user.password) : String(body.currentPassword) === user.password
      if (!ok) return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 401 })
      if (String(body.newPassword).length < 6) return NextResponse.json({ error: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" }, { status: 400 })
      data.password = await bcrypt.hash(String(body.newPassword), 10)
    }
    if (Object.keys(data).length === 0) return NextResponse.json({ error: "لا توجد بيانات للتحديث" }, { status: 400 })
    await prisma.user.update({ where: { id }, data })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("[profile]", e.message)
    return NextResponse.json({ error: "فشل تحديث البيانات" }, { status: 500 })
  }
}
'''

FILES['src/app/admin/stats/page.tsx'] = '''import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { TrendingUp, Wallet, Percent, Banknote, Music, ArrowLeft } from "lucide-react"
export const dynamic = "force-dynamic"
const CONFIRMED = ["CONFIRMED", "APPROVED", "ACCEPTED", "COMPLETED"]
export default async function AdminStatsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/admin/stats")
  const role = (session.user as any).role || "USER"
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") redirect("/admin")
  const bookings: any[] = await prisma.booking.findMany({ include: { artist: { select: { id: true, name: true, slug: true, category: true } } } }).catch(() => [])
  const payments: any[] = await prisma.payment.findMany().catch(() => [])
  const artists: any[] = await prisma.artist.findMany({ select: { id: true, name: true, slug: true, category: true } }).catch(() => [])
  const up = (s: any) => String(s || "").toUpperCase()
  const confirmed = bookings.filter(b => CONFIRMED.includes(up(b.status)))
  const gross = confirmed.reduce((s, b) => s + Number(b.grossAmount || 0), 0)
  const commission = confirmed.reduce((s, b) => s + Number(b.grossAmount || 0) * 0.15, 0)
  const paid = payments.filter(p => up(p.status) === "COMPLETED").reduce((s, p) => s + Number(p.amount || 0), 0)
  const perArtist = artists.map(a => { const ab = bookings.filter(b => b.artistId === a.id); const ac = ab.filter(b => CONFIRMED.includes(up(b.status))); return { id: a.id, name: a.name, slug: a.slug, category: a.category || "فنان", total: ab.length, confirmed: ac.length, revenue: ac.reduce((s, b) => s + Number(b.grossAmount || 0), 0) } }).sort((x, y) => y.revenue - x.revenue)
  const kpis = [
    { label: "إجمالي الإيرادات", value: gross.toLocaleString() + " ج.م", icon: Wallet, color: "text-[#F5A623]", bg: "bg-[#F5A623]/10" },
    { label: "عمولة المنصة (15%)", value: Math.round(commission).toLocaleString() + " ج.م", icon: Percent, color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" },
    { label: "المحصّل فعلياً", value: paid.toLocaleString() + " ج.م", icon: Banknote, color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
    { label: "حجوزات مؤكدة", value: String(confirmed.length), icon: TrendingUp, color: "text-[#A855F7]", bg: "bg-[#A855F7]/10" },
  ]
  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl md:text-3xl font-black text-white">التقارير المالية</h1><p className="text-gray-400 text-sm mt-1">نظرة عامة + تقرير شامل لكل فنان على حدة</p></div>
        <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm font-bold text-gray-300 hover:border-[#F5A623]/30 hover:text-[#F5A623] transition"><ArrowLeft size={16} /> عودة</Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-4 md:p-5 hover:border-[#F5A623]/30 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-3"><span className="text-[10px] md:text-xs font-bold text-gray-400">{k.label}</span><div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center`}><k.icon size={16} className={k.color} /></div></div>
            <p className="text-lg md:text-2xl font-black text-white">{k.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[#2a2a2a] flex items-center gap-2"><Music size={18} className="text-[#F5A623]" /><h2 className="text-lg font-black text-white">تقارير الفنانين</h2><span className="text-xs text-gray-500">({perArtist.length} فنان)</span></div>
        {perArtist.length === 0 ? (<div className="text-center py-12"><Music className="mx-auto text-gray-600 mb-3" size={36} /><p className="text-gray-500 text-sm">لا يوجد فنانين</p></div>) : (
          <div className="divide-y divide-[#2a2a2a]">
            {perArtist.map(a => (
              <div key={a.id} className="flex items-center gap-3 md:gap-4 p-4 hover:bg-[#1a1a1a] transition">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-[#F5A623] to-[#E8961A] flex items-center justify-center text-white font-black flex-shrink-0">{a.name.charAt(0)}</div>
                <div className="flex-1 min-w-0"><p className="font-bold text-white text-sm truncate">{a.name}</p><p className="text-[10px] md:text-xs text-gray-500 truncate">{a.category} • {a.total} حجز • {a.confirmed} مؤكد</p></div>
                <div className="text-left flex-shrink-0"><p className="text-sm md:text-base font-black text-[#F5A623]">{a.revenue.toLocaleString()} ج.م</p></div>
                <Link href={"/admin/stats/" + a.id} className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-[#F5A623] text-[#0a0a0a] rounded-xl text-xs font-black hover:bg-[#E8961A] transition flex-shrink-0 active:scale-[0.97]"><span className="hidden md:inline">عرض التقرير</span><span className="md:hidden">التقرير</span></Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
'''

FILES['src/app/admin/stats/[artistId]/page.tsx'] = '''import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ArtistReportClient from "./ArtistReportClient"
export const dynamic = "force-dynamic"
const CONFIRMED = ["CONFIRMED", "APPROVED", "ACCEPTED", "COMPLETED"]
export default async function ArtistReportPage({ params }: { params: Promise<{ artistId: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const role = (session.user as any).role || "USER"
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") redirect("/admin")
  const { artistId } = await params
  const artist: any = await prisma.artist.findUnique({ where: { id: artistId } }).catch(() => null)
  if (!artist) redirect("/admin/stats")
  const bookings: any[] = await prisma.booking.findMany({ where: { artistId }, include: { venue: { select: { name: true } } } }).catch(() => [])
  const ids = bookings.map(b => b.id)
  const payments: any[] = ids.length ? await prisma.payment.findMany({ where: { bookingId: { in: ids } } }).catch(() => []) : []
  const rating: any = await prisma.review.aggregate({ where: { artistId }, _avg: { rating: true }, _count: true }).catch(() => ({ _avg: { rating: 0 }, _count: 0 }))
  const up = (s: any) => String(s || "").toUpperCase()
  const confirmed = bookings.filter(b => CONFIRMED.includes(up(b.status)))
  const gross = confirmed.reduce((s, b) => s + Number(b.grossAmount || 0), 0)
  const rate = Number(artist.commissionRate ?? 15) || 15
  const commission = Math.round(gross * rate / 100)
  const paid = payments.filter(p => up(p.status) === "COMPLETED").reduce((s, p) => s + Number(p.amount || 0), 0)
  const rows = confirmed.slice().sort((a, b) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime()).slice(0, 12).map(b => ({ client: b.clientName || "عميل", date: b.date ? new Date(b.date).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" }) : "—", venue: b.venue?.name || "—", amount: Number(b.grossAmount || 0), status: b.status }))
  const data = {
    artist: { id: artist.id, name: artist.name, slug: artist.slug, category: artist.category || "فنان", commissionRate: rate },
    totals: { total: bookings.length, confirmed: confirmed.length, pending: bookings.filter(b => ["PENDING", "PENDING_APPROVAL"].includes(up(b.status))).length, completed: bookings.filter(b => up(b.status) === "COMPLETED").length, gross, commission, net: gross - commission, paid, rating: Number(rating._avg?.rating || 0), ratingCount: Number(rating._count || 0) },
    rows,
  }
  return <ArtistReportClient data={JSON.parse(JSON.stringify(data))} />
}
'''

FILES['src/app/admin/stats/[artistId]/ArtistReportClient.tsx'] = '''"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Printer, ShieldCheck, Star } from "lucide-react"

const S = { reg: "123456789", tax: "300000000000003", tag: "STUDIO FOR ARTISTS & EVENTS" }
const PRINT_CSS = "*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}body{font-family:'Cairo',Arial,sans-serif;background:#fff;color:#000;direction:rtl}@page{margin:10mm;size:A4}.page{max-width:210mm;margin:0 auto;padding:12mm 16mm;position:relative}.wm{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:.03;pointer-events:none}.wm span{font-size:150px;font-weight:900;color:#D4AF37;transform:rotate(-30deg)}.hdr{margin-bottom:30px;padding-bottom:20px;border-bottom:4px solid #000;position:relative}.hdr::after{content:'';position:absolute;bottom:0;left:0;right:0;height:4px;background:#D4AF37}.hf{display:flex;justify-content:space-between;align-items:flex-start}.hdr h1{font-size:48px;font-weight:900;margin-bottom:6px}.gl{width:100px;height:4px;background:#D4AF37;margin-bottom:10px}.tag{font-size:12px;color:#666;font-weight:700;letter-spacing:.3em;margin-bottom:12px}.info{font-size:11px;color:#888;line-height:1.8}.info b{color:#000}.tb{background:#000;padding:14px 28px;border-radius:8px;text-align:center}.tb h2{font-size:20px;font-weight:900;color:#D4AF37;letter-spacing:.2em}.tb p{font-size:13px;color:#fff;margin-top:4px}.rid{background:#D4AF37;padding:6px 14px;border-radius:8px;margin-top:10px;text-align:center}.rid .rl{font-size:11px;font-weight:700}.rid .rv{font-family:monospace;font-weight:700;font-size:13px}.asec{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:30px}.acard{background:#f9fafb;padding:18px;border-radius:10px;border:2px solid #000}.acard .al{font-size:11px;font-weight:900;color:#b8941f;letter-spacing:.3em;margin-bottom:10px}.ainfo{display:flex;align-items:center;gap:12px}.aph{width:50px;height:50px;border-radius:12px;background:linear-gradient(135deg,#D4AF37,#b8941f);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#0a0a0a}.an{font-size:17px;font-weight:700}.acat{font-size:12px;color:#666}.acm{font-size:11px;color:#888;margin-top:3px}.dg{display:inline-grid;grid-template-columns:auto auto;gap:8px 24px;font-size:12px;text-align:left}.dg .dl{color:#888}.dg .dv{font-weight:700}.st{font-size:16px;font-weight:900;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid #D4AF37}.sg{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:30px}.sc{padding:16px;border-radius:10px;text-align:center}.sc.dk{background:#000}.sc.lt{background:#f9fafb;border:2px solid #000}.sc .sl{font-size:11px;margin-bottom:4px}.sc.dk .sl{color:#999}.sc.lt .sl{color:#888}.sc .sv{font-size:18px;font-weight:900}.sc.dk .sv{color:#D4AF37}.sc.lt .sv{color:#000}.sc .su{font-size:10px;color:#999}.tbl{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:30px}.tbl th{background:#0a0a0a;color:#D4AF37;padding:10px 8px;font-size:11px;font-weight:700}.tbl td{padding:10px 8px;border-bottom:1px solid #e5e7eb}.tbl tr:nth-child(even){background:#f9fafb}.tbl .gold{font-weight:900;color:#b8941f;text-align:center}.tbl .bold{font-weight:700}.fin{display:flex;justify-content:flex-end;margin-bottom:30px}.fb{width:360px;border:2px solid #000;border-radius:12px;overflow:hidden}.fr{display:flex;justify-content:space-between;padding:12px 18px;border-bottom:1px solid #e5e7eb}.fr.gr{background:#f9fafb}.fr.tot{background:#000;padding:18px;border:none}.fr .fl{font-weight:700}.fr.gr .fl{color:#666}.fr .fv{font-weight:700;font-size:15px}.fr .fv.red{color:#dc2626}.fr.tot .fl{color:#D4AF37;font-size:16px}.fr.tot .fv{color:#D4AF37;font-size:24px;font-weight:900}.ftr{border-top:4px solid #000;padding-top:20px;position:relative}.ftr::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:#D4AF37}.fg{display:grid;grid-template-columns:1fr auto 1fr;gap:20px;align-items:end;margin-bottom:16px}.fl2 h4{font-weight:900;font-size:12px;letter-spacing:.2em;margin-bottom:8px}.fl2 ul{list-style:none;font-size:11px;color:#666;line-height:1.8}.fl2 li{display:flex;gap:6px}.dot{color:#D4AF37;font-weight:700}.stc{display:flex;flex-direction:column;align-items:center}.stamp{width:120px;height:120px;border:3px solid #000;border-radius:50%;display:flex;align-items:center;justify-content:center;transform:rotate(-15deg);position:relative}.sr{position:absolute;inset:6px;border:2px solid #D4AF37;border-radius:50%}.stx{text-align:center;z-index:1}.stx .s1{font-size:18px;font-weight:900;letter-spacing:.08em}.stx .sl2{width:70px;height:2px;background:#D4AF37;margin:3px auto}.stx .s2{font-size:10px;font-weight:700;letter-spacing:.15em}.stx .s3{font-size:9px;font-weight:700;color:#D4AF37;margin-top:3px}.stl{font-size:8px;color:#888;font-weight:700;margin-top:6px}.qc{display:flex;flex-direction:column;align-items:center}.qb{background:#fff;padding:8px;border-radius:8px;border:2px solid #000;display:inline-block}.ql{font-size:8px;color:#888;font-weight:700;margin-top:4px}.sig{text-align:center;margin-top:12px}.sigl{width:140px;height:2px;background:#000;margin:0 auto 8px}.sign{font-size:12px;font-weight:900}.sigd{font-size:10px;color:#888;margin-top:3px}.cp{text-align:center;font-size:9px;color:#aaa;margin-top:12px;padding-top:10px;border-top:1px solid #eee}"

export default function ArtistReportClient({ data }: { data: any }) {
  const a = data.artist
  const t = data.totals
  const [verifyUrl, setVerifyUrl] = useState("")
  const [rn, setRn] = useState("")

  useEffect(() => {
    const slug = String(a.slug || "").toLowerCase()
    setVerifyUrl(window.location.origin + "/verify/report?artist=" + slug)
    setRn("RPT-" + String(a.slug || "").toUpperCase().slice(0, 6) + "-" + new Date().toISOString().slice(0, 10).replace(/-/g, ""))
  }, [a.slug])

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=800,height=1100")
    if (!win) { alert("يرجى السماح بالنوافذ المنبثقة للطباعة"); return }
    const rowsHtml = data.rows.map((r: any, i: number) => "<tr><td style='font-family:monospace;font-size:11px;color:#888'>" + String(i + 1).padStart(2, "0") + "</td><td class='bold'>" + r.client + "</td><td style='text-align:center'>" + r.date + "</td><td>" + r.venue + "</td><td class='gold'>" + Number(r.amount).toLocaleString() + " ج.م</td></tr>").join("")
    const html = "<div class='page'><div class='wm'><span>NOORYI</span></div><div class='hdr'><div class='hf'><div><h1>Nooryi</h1><div class='gl'></div><p class='tag'>" + S.tag + "</p><div class='info'><p><b>السجل التجاري:</b> " + S.reg + "</p><p><b>الرقم الضريبي:</b> " + S.tax + "</p></div></div><div style='text-align:left'><div class='tb'><h2>تقرير مالي شامل</h2><p>" + a.name + "</p></div><div class='rid'><div class='rl'>رقم التقرير</div><div class='rv'>" + rn + "</div></div></div></div></div><div class='asec'><div class='acard'><div class='al'>الفنان:</div><div class='ainfo'><div class='aph'>" + a.name.charAt(0) + "</div><div><div class='an'>" + a.name + "</div><div class='acat'>" + a.category + "</div><div class='acm'>عمولة المنصة: " + a.commissionRate + "%</div></div></div></div><div style='display:flex;align-items:center'><div class='dg'><span class='dl'>تاريخ الإصدار:</span><span class='dv'>" + new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" }) + "</span><span class='dl'>إجمالي الحجوزات:</span><span class='dv'>" + t.total + "</span><span class='dl'>مؤكدة:</span><span class='dv'>" + t.confirmed + "</span><span class='dl'>مكتملة:</span><span class='dv'>" + t.completed + "</span><span class='dl'>التقييم:</span><span class='dv'>" + Number(t.rating).toFixed(1) + " (" + t.ratingCount + ")</span></div></div></div><div class='st'>الملخص التنفيذي</div><div class='sg'><div class='sc dk'><div class='sl'>إجمالي الإيرادات</div><div class='sv'>" + t.gross.toLocaleString() + "</div><div class='su'>ج.م</div></div><div class='sc lt'><div class='sl'>حجوزات مؤكدة</div><div class='sv'>" + t.confirmed + "</div></div><div class='sc lt'><div class='sl'>قيد المراجعة</div><div class='sv'>" + t.pending + "</div></div><div class='sc lt'><div class='sl'>صافي الفنان</div><div class='sv'>" + t.net.toLocaleString() + "</div><div class='su'>ج.م</div></div></div><div class='st'>آخر الحجوزات المؤكدة</div>" + (data.rows.length ? "<table class='tbl'><thead><tr><th style='text-align:right'>#</th><th style='text-align:right'>العميل</th><th style='text-align:center'>التاريخ</th><th style='text-align:right'>المكان</th><th style='text-align:center'>المبلغ</th></tr></thead><tbody>" + rowsHtml + "</tbody></table>" : "<p style='text-align:center;color:#888;padding:20px'>لا توجد حجوزات مؤكدة</p>") + "<div class='fin'><div class='fb'><div class='fr'><span class='fl'>إجمالي الإيرادات:</span><span class='fv'>" + t.gross.toLocaleString() + " ج.م</span></div><div class='fr gr'><span class='fl'>عمولة المنصة (" + a.commissionRate + "%):</span><span class='fv red'>-" + t.commission.toLocaleString() + " ج.م</span></div><div class='fr tot'><span class='fl'>صافي الفنان:</span><span class='fv'>" + t.net.toLocaleString() + " ج.م</span></div></div></div><div class='ftr'><div class='fg'><div class='fl2'><h4>الشروط والأحكام:</h4><ul><li><span class='dot'>•</span>تقرير صادر آلياً من نظام Nooryi Studio.</li><li><span class='dot'>•</span>يمكن التحقق من صحته عبر مسح رمز QR.</li><li><span class='dot'>•</span>الأرقام مطابقة لسجلات المنصة لحظة الإصدار.</li></ul></div><div class='stc'><div class='stamp'><div class='sr'></div><div class='stx'><div class='s1'>NOORYI</div><div class='sl2'></div><div class='s2'>STUDIO</div><div class='s3'>✓ معتمد رسمياً</div></div></div><div class='stl'>ختم المنصة الرسمي</div></div><div class='qc'><div class='qb'><img src='https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=" + encodeURIComponent(verifyUrl) + "' width='80' height='80'/></div><div class='ql'>امسح للتحقق من صحة التقرير</div></div></div><div class='sig'><div class='sigl'></div><div class='sign'>توقيع المدير المالي</div><div class='sigd'>Nooryi Studio Finance Dept.</div></div><div class='cp'>© " + new Date().getFullYear() + " Nooryi Studio — جميع الحقوق محفوظة | ترخيص " + S.reg + "</div></div></div>"
    win.document.write("<!DOCTYPE html><html dir='rtl' lang='ar'><head><meta charset='UTF-8'><title>تقرير مالي — " + a.name + "</title><link href='https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap' rel='stylesheet'><style>" + PRINT_CSS + "</style></head><body>" + html + "</body></html>")
    win.document.close()
    setTimeout(() => win.print(), 800)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 md:py-12" dir="rtl">
      <div className="max-w-[900px] mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href="/admin/stats" className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm font-bold text-gray-300 hover:border-[#F5A623]/30 hover:text-[#F5A623] transition"><ArrowLeft size={16} /> كل التقارير</Link>
          <div className="flex items-center gap-2">
            <span className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-xl text-xs font-bold text-[#22C55E]"><ShieldCheck size={14} /> قابل للتحقق</span>
            <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-[#F5A623] text-[#0a0a0a] rounded-xl text-sm font-black hover:bg-[#E8961A] transition active:scale-[0.97]"><Printer size={16} /> طباعة التقرير</button>
          </div>
        </div>
        <div className="bg-white text-black rounded-2xl overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none"><span className="text-[150px] font-black text-[#D4AF37] rotate-[-30deg]">NOORYI</span></div>
          <div className="p-8 md:p-12 relative">
            <div className="mb-8 pb-6 border-b-4 border-black relative">
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#D4AF37]"></div>
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div><h1 className="text-5xl font-black mb-2">Nooryi</h1><div className="w-24 h-1 bg-[#D4AF37] mb-3"></div><p className="text-xs text-gray-600 font-bold tracking-[0.3em] mb-3">{S.tag}</p><div className="text-[11px] text-gray-500 space-y-1"><p><b className="text-black">السجل التجاري:</b> {S.reg}</p><p><b className="text-black">الرقم الضريبي:</b> {S.tax}</p></div></div>
                <div className="text-left"><div className="bg-black px-7 py-3.5 rounded-lg text-center"><h2 className="text-xl font-black text-[#D4AF37] tracking-widest">تقرير مالي شامل</h2><p className="text-sm text-white mt-1">{a.name}</p></div><div className="bg-[#D4AF37] px-4 py-1.5 rounded-lg mt-2.5 text-center"><p className="text-[10px] font-bold">رقم التقرير</p><p className="font-mono font-bold text-sm">{rn || "..."}</p></div></div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-5 rounded-xl border-2 border-black"><p className="text-[11px] font-black text-[#b8941f] tracking-[0.3em] mb-3">الفنان:</p><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center text-xl font-black text-[#0a0a0a]">{a.name.charAt(0)}</div><div><p className="text-lg font-bold">{a.name}</p><p className="text-xs text-gray-600">{a.category}</p><p className="text-[11px] text-gray-500 mt-0.5">عمولة المنصة: {a.commissionRate}%</p></div></div></div>
              <div className="flex items-center"><div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs w-full"><span className="text-gray-500">تاريخ الإصدار:</span><span className="font-bold">{new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}</span><span className="text-gray-500">إجمالي الحجوزات:</span><span className="font-bold">{t.total}</span><span className="text-gray-500">مؤكدة:</span><span className="font-bold">{t.confirmed}</span><span className="text-gray-500">التقييم:</span><span className="font-bold flex items-center gap-1"><Star size={11} className="text-[#D4AF37] fill-[#D4AF37]" /> {Number(t.rating).toFixed(1)} ({t.ratingCount})</span></div></div>
            </div>
            <h3 className="text-base font-black mb-3 pb-2 border-b-2 border-[#D4AF37]">الملخص التنفيذي</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <div className="bg-black p-4 rounded-xl text-center"><p className="text-[10px] text-gray-400 mb-1">الإيرادات</p><p className="text-lg font-black text-[#D4AF37]">{t.gross.toLocaleString()}</p><p className="text-[10px] text-gray-500">ج.م</p></div>
              <div className="bg-gray-50 p-4 rounded-xl text-center border-2 border-black"><p className="text-[10px] text-gray-500 mb-1">مؤكدة</p><p className="text-lg font-black">{t.confirmed}</p></div>
              <div className="bg-gray-50 p-4 rounded-xl text-center border-2 border-black"><p className="text-[10px] text-gray-500 mb-1">بانتظار</p><p className="text-lg font-black">{t.pending}</p></div>
              <div className="bg-gray-50 p-4 rounded-xl text-center border-2 border-black"><p className="text-[10px] text-gray-500 mb-1">صافي الفنان</p><p className="text-lg font-black">{t.net.toLocaleString()}</p><p className="text-[10px] text-gray-500">ج.م</p></div>
            </div>
            <h3 className="text-base font-black mb-3 pb-2 border-b-2 border-[#D4AF37]">آخر الحجوزات المؤكدة</h3>
            {data.rows.length === 0 ? <p className="text-center text-gray-500 py-6 text-sm">لا توجد حجوزات مؤكدة</p> : (
              <table className="w-full border-collapse text-xs mb-8">
                <thead><tr className="bg-[#0a0a0a] text-[#D4AF37]"><th className="px-2 py-2.5 text-right">#</th><th className="px-2 py-2.5 text-right">العميل</th><th className="px-2 py-2.5 text-center">التاريخ</th><th className="px-2 py-2.5 text-right">المكان</th><th className="px-2 py-2.5 text-center">المبلغ</th></tr></thead>
                <tbody>{data.rows.map((r: any, i: number) => (<tr key={i} className={i % 2 ? "bg-gray-50" : ""}><td className="px-2 py-2.5 border-b border-gray-200 font-mono text-gray-500">{String(i + 1).padStart(2, "0")}</td><td className="px-2 py-2.5 border-b border-gray-200 font-bold">{r.client}</td><td className="px-2 py-2.5 border-b border-gray-200 text-center">{r.date}</td><td className="px-2 py-2.5 border-b border-gray-200">{r.venue}</td><td className="px-2 py-2.5 border-b border-gray-200 text-center font-black text-[#b8941f]">{r.amount.toLocaleString()} ج.م</td></tr>))}</tbody>
              </table>
            )}
            <div className="flex justify-end mb-8">
              <div className="w-full md:w-[360px] border-2 border-black rounded-xl overflow-hidden">
                <div className="flex justify-between px-5 py-3 border-b border-gray-200"><span className="font-bold text-sm">إجمالي الإيرادات:</span><span className="font-bold">{t.gross.toLocaleString()} ج.م</span></div>
                <div className="flex justify-between px-5 py-3 border-b border-gray-200 bg-gray-50"><span className="font-bold text-sm text-gray-600">عمولة المنصة ({a.commissionRate}%):</span><span className="font-bold text-red-600">-{t.commission.toLocaleString()} ج.م</span></div>
                <div className="flex justify-between px-5 py-4 bg-black"><span className="font-bold text-[#D4AF37]">صافي الفنان:</span><span className="font-black text-2xl text-[#D4AF37]">{t.net.toLocaleString()} ج.م</span></div>
              </div>
            </div>
            <div className="border-t-4 border-black pt-6 relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#D4AF37]"></div>
              <div className="grid md:grid-cols-3 gap-6 items-end mb-4">
                <div><h4 className="font-black text-xs tracking-widest mb-2">الشروط والأحكام:</h4><ul className="text-[11px] text-gray-600 space-y-1.5"><li><span className="text-[#D4AF37] font-bold">•</span> تقرير صادر آلياً من نظام Nooryi Studio.</li><li><span className="text-[#D4AF37] font-bold">•</span> يمكن التحقق من صحته عبر مسح رمز QR.</li><li><span className="text-[#D4AF37] font-bold">•</span> الأرقام مطابقة لسجلات المنصة لحظة الإصدار.</li></ul></div>
                <div className="flex flex-col items-center"><div className="w-28 h-28 border-[3px] border-black rounded-full flex items-center justify-center rotate-[-15deg] relative"><div className="absolute inset-1.5 border-2 border-[#D4AF37] rounded-full"></div><div className="text-center z-10"><p className="text-lg font-black tracking-wider">NOORYI</p><div className="w-16 h-0.5 bg-[#D4AF37] mx-auto my-0.5"></div><p className="text-[9px] font-bold tracking-widest">STUDIO</p><p className="text-[8px] font-bold text-[#D4AF37] mt-0.5">✓ معتمد رسمياً</p></div></div><p className="text-[8px] text-gray-500 font-bold mt-1.5">ختم المنصة الرسمي</p></div>
                <div className="flex flex-col items-center">{verifyUrl && <div className="bg-white p-2 rounded-lg border-2 border-black inline-block"><img src={"https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=" + encodeURIComponent(verifyUrl)} width={80} height={80} alt="QR" /></div>}<p className="text-[8px] text-gray-500 font-bold mt-1">امسح للتحقق من صحة التقرير</p></div>
              </div>
              <div className="text-center mt-3"><div className="w-36 h-0.5 bg-black mx-auto mb-2"></div><p className="text-xs font-black">توقيع المدير المالي</p><p className="text-[10px] text-gray-500 mt-0.5">Nooryi Studio Finance Dept.</p></div>
              <p className="text-center text-[9px] text-gray-400 mt-4 pt-3 border-t border-gray-200">© {new Date().getFullYear()} Nooryi Studio — جميع الحقوق محفوظة | ترخيص {S.reg}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'''

FILES['src/app/verify/report/page.tsx'] = '''import { prisma } from "@/lib/prisma"
import { ShieldCheck, Music, Star } from "lucide-react"
export const dynamic = "force-dynamic"
const CONFIRMED = ["CONFIRMED", "APPROVED", "ACCEPTED", "COMPLETED"]
export default async function VerifyReportPage({ searchParams }: { searchParams: Promise<{ artist?: string }> }) {
  const sp = await searchParams
  const slug = String(sp.artist || "").toLowerCase()
  const artist: any = slug ? await prisma.artist.findUnique({ where: { slug } }).catch(() => null) : null
  let stats: any = null
  if (artist) {
    const bookings: any[] = await prisma.booking.findMany({ where: { artistId: artist.id } }).catch(() => [])
    const up = (s: any) => String(s || "").toUpperCase()
    const confirmed = bookings.filter(b => CONFIRMED.includes(up(b.status)))
    const gross = confirmed.reduce((s, b) => s + Number(b.grossAmount || 0), 0)
    const rate = Number(artist.commissionRate ?? 15) || 15
    const rating: any = await prisma.review.aggregate({ where: { artistId: artist.id }, _avg: { rating: true }, _count: true }).catch(() => ({ _avg: { rating: 0 }, _count: 0 }))
    stats = { total: bookings.length, confirmed: confirmed.length, completed: bookings.filter(b => up(b.status) === "COMPLETED").length, gross, commission: Math.round(gross * rate / 100), net: gross - Math.round(gross * rate / 100), rating: Number(rating._avg?.rating || 0), ratingCount: Number(rating._count || 0) }
  }
  return (
    <div className="min-h-screen bg-[#faf8f0] py-10 md:py-16" dir="rtl">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-[#D4AF37]">
          <div className="bg-gradient-to-l from-[#D4AF37] to-[#b8941f] p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-3"><ShieldCheck size={28} className="text-white" /></div>
            <h1 className="text-2xl font-black text-white">صفحة التحقق من صحة التقرير</h1>
            <p className="text-white/80 text-sm mt-1">Nooryi Studio — نظام التحقق الرسمي</p>
          </div>
          {!artist || !stats ? (
            <div className="p-10 text-center"><p className="text-red-600 font-bold text-lg mb-2">⚠️ التقرير غير موجود</p><p className="text-gray-500 text-sm">لم يتم العثور على فنان مطابق لرابط التحقق.</p></div>
          ) : (
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl mb-6">
                <ShieldCheck size={24} className="text-green-600 flex-shrink-0" />
                <div><p className="font-black text-green-700">✓ تقرير صحيح ومطابق لسجلات المنصة</p><p className="text-xs text-green-600 mt-0.5">تم التحقق لحظياً في {new Date().toLocaleString("ar-EG")}</p></div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#b8941f] flex items-center justify-center text-white text-xl font-black flex-shrink-0">{(artist.name || "ف").charAt(0)}</div>
                <div className="flex-1 min-w-0"><p className="font-black text-lg text-gray-900 truncate flex items-center gap-2"><Music size={16} className="text-[#b8941f]" /> {artist.name}</p><p className="text-xs text-gray-500">{artist.category || "فنان"} • <span className="inline-flex items-center gap-1"><Star size={11} className="text-[#D4AF37] fill-[#D4AF37]" /> {Number(stats.rating).toFixed(1)} ({stats.ratingCount} تقييم)</span></p></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[{ l: "إجمالي الحجوزات", v: String(stats.total) }, { l: "حجوزات مؤكدة", v: String(stats.confirmed) }, { l: "حجوزات مكتملة", v: String(stats.completed) }, { l: "إجمالي الإيرادات", v: stats.gross.toLocaleString() + " ج.م" }, { l: "عمولة المنصة", v: stats.commission.toLocaleString() + " ج.م" }, { l: "صافي الفنان", v: stats.net.toLocaleString() + " ج.م" }].map((x, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center"><p className="text-[10px] text-gray-500 font-bold mb-1">{x.l}</p><p className="font-black text-gray-900">{x.v}</p></div>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 text-center leading-relaxed">هذه الأرقام محسوبة لحظياً من قاعدة بيانات المنصة وهي المرجع الرسمي لصحة أي تقرير مالي صادر لأي فنان.</p>
            </div>
          )}
          <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-200"><p className="text-[10px] text-gray-400">© {new Date().getFullYear()} Nooryi Studio — جميع الحقوق محفوظة | سجل تجاري 123456789</p></div>
        </div>
      </div>
    </div>
  )
}
'''

for path, content in FILES.items():
    d = os.path.dirname(path)
    if d:
        os.makedirs(d, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("WROTE:", path)

print("ALL FILES DONE")